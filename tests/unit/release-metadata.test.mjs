import assert from 'node:assert/strict';
import test from 'node:test';

import { verifyRelease } from '../../scripts/verify-release.mjs';

const valid = {
  tag: 'v2.3.4',
  version: '2.3.4',
  changelog: '# Changelog\n\n## [2.3.4] - 2026-08-23\n\n- Release notes.\n'
};

test('release metadata accepts a matching tag, version and dated changelog', () => {
  assert.doesNotThrow(() => verifyRelease(valid));
});

test('release metadata rejects a mismatched tag', () => {
  assert.throws(() => verifyRelease({ ...valid, tag: 'v2.3.5' }), /must match package version/);
});

test('release metadata rejects an undated changelog entry', () => {
  assert.throws(
    () => verifyRelease({ ...valid, changelog: '## Unreleased\n' }),
    /needs a dated \[2.3.4\] heading/
  );
});
