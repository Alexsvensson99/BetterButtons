import assert from 'node:assert/strict';
import test from 'node:test';

import { APPROVED_MAINTAINER_EMAIL, findIdentityViolations } from '../../scripts/check-commit-identities.mjs';

test('commit identity check accepts the approved maintainer noreply address', () => {
  assert.deepEqual(
    findIdentityViolations({
      authorName: 'Alexander Svensson',
      authorEmail: APPROVED_MAINTAINER_EMAIL,
      committerName: 'Alexander Svensson',
      committerEmail: APPROVED_MAINTAINER_EMAIL
    }),
    []
  );
});

test('commit identity check rejects a non-noreply maintainer author without returning the address', () => {
  assert.deepEqual(
    findIdentityViolations({
      authorName: 'Alexander Svensson',
      authorEmail: 'private@example.invalid',
      committerName: 'GitHub',
      committerEmail: 'noreply@github.com'
    }),
    ['author']
  );
});

test('commit identity check rejects a non-noreply maintainer committer', () => {
  assert.deepEqual(
    findIdentityViolations({
      authorName: 'dependabot[bot]',
      authorEmail: '49699333+dependabot[bot]@users.noreply.github.com',
      committerName: 'Alexander Svensson',
      committerEmail: 'private@example.invalid'
    }),
    ['committer']
  );
});

test('commit identity check does not restrict external contributor identities', () => {
  assert.deepEqual(
    findIdentityViolations({
      authorName: 'Example Contributor',
      authorEmail: 'contributor@example.com',
      committerName: 'GitHub',
      committerEmail: 'noreply@github.com'
    }),
    []
  );
});
