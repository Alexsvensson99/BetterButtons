import { readFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export function verifyRelease({ tag, version, changelog }) {
  const expectedTag = `v${version}`;
  if (tag !== expectedTag) {
    throw new Error(`Release tag ${tag || '(missing)'} must match package version ${expectedTag}.`);
  }

  const escapedVersion = version.replaceAll('.', '\\.');
  const datedHeading = new RegExp(`^## \\[${escapedVersion}\\] - \\d{4}-\\d{2}-\\d{2}$`, 'm');
  if (!datedHeading.test(changelog)) {
    throw new Error(`CHANGELOG.md needs a dated [${version}] heading before ${expectedTag} can build.`);
  }
}

const isMainModule = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMainModule) {
  const root = join(dirname(fileURLToPath(import.meta.url)), '..');
  const packageJson = JSON.parse(await readFile(join(root, 'package.json'), 'utf8'));
  const changelog = await readFile(join(root, 'CHANGELOG.md'), 'utf8');
  verifyRelease({
    tag: process.env.GITHUB_REF_NAME,
    version: packageJson.version,
    changelog
  });
  console.log(`Release metadata verified for v${packageJson.version}.`);
}
