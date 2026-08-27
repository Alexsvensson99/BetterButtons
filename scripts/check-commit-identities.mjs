import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const APPROVED_MAINTAINER_EMAIL = '25175104+Alexsvensson99@users.noreply.github.com';
export const MAINTAINER_NAME = 'Alexander Svensson';

const ZERO_SHA = '0000000000000000000000000000000000000000';

export function findIdentityViolations({ authorEmail, authorName, committerEmail, committerName }) {
  const approvedEmail = APPROVED_MAINTAINER_EMAIL.toLowerCase();
  const violations = [];

  if (authorName === MAINTAINER_NAME && authorEmail.toLowerCase() !== approvedEmail) {
    violations.push('author');
  }

  if (committerName === MAINTAINER_NAME && committerEmail.toLowerCase() !== approvedEmail) {
    violations.push('committer');
  }

  return violations;
}

function runGit(args) {
  return execFileSync('git', args, { encoding: 'utf8' }).trim();
}

function listCommits({ base, head }) {
  if (!head) {
    throw new Error('A head commit is required for the commit identity privacy check.');
  }

  const revision = base && base !== ZERO_SHA ? `${base}..${head}` : head;
  const output = runGit(['rev-list', '--reverse', revision]);
  return output ? output.split('\n') : [];
}

function readIdentity(commit) {
  const output = runGit([
    'show',
    '--no-show-signature',
    '--quiet',
    '--format=%H%x1f%an%x1f%ae%x1f%cn%x1f%ce',
    commit
  ]);
  const [sha, authorName, authorEmail, committerName, committerEmail] = output.split('\x1f');

  if (!sha || !authorName || !authorEmail || !committerName || !committerEmail) {
    throw new Error(`Could not read complete commit identity metadata for ${commit}.`);
  }

  return { sha, authorName, authorEmail, committerName, committerEmail };
}

export function verifyCommitIdentities({ base, head }) {
  const commits = listCommits({ base, head });

  for (const commit of commits) {
    const identity = readIdentity(commit);
    const violations = findIdentityViolations(identity);

    if (violations.length > 0) {
      const emailLabel = violations.length === 1 ? 'email is' : 'emails are';
      throw new Error(
        `Commit identity privacy check failed for ${identity.sha}: maintainer ${violations.join(
          ' and '
        )} ${emailLabel} not the approved GitHub noreply identity.`
      );
    }
  }

  return { checkedCommits: commits.length };
}

const isMainModule = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMainModule) {
  try {
    const base = process.argv[2] || process.env.COMMIT_IDENTITY_BASE_SHA;
    const head = process.argv[3] || process.env.COMMIT_IDENTITY_HEAD_SHA;
    const { checkedCommits } = verifyCommitIdentities({ base, head });
    console.log(`Commit identity privacy check passed for ${checkedCommits} commit(s).`);
  } catch (error) {
    console.error(error instanceof Error ? error.message : 'Commit identity privacy check failed.');
    process.exitCode = 1;
  }
}
