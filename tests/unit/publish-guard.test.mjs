import assert from 'node:assert/strict';
import test from 'node:test';

import { verifyPublishGuard } from '../../scripts/publish-guard.mjs';

test('publish guard rejects a private package', () => {
  assert.throws(
    () => verifyPublishGuard({ approval: 'v2.0.0', packageJson: { private: true, version: '2.0.0' } }),
    /still marked private/
  );
});

test('publish guard rejects missing or stale version approval', () => {
  assert.throws(
    () => verifyPublishGuard({ approval: 'v1.9.0', packageJson: { version: '2.0.0' } }),
    /BETTERBUTTONS_PUBLISH=v2.0.0/
  );
});

test('publish guard accepts an unlocked package with exact version approval', () => {
  assert.doesNotThrow(() =>
    verifyPublishGuard({ approval: 'v2.0.0', packageJson: { private: false, version: '2.0.0' } })
  );
});
