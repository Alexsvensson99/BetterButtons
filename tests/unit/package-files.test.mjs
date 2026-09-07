import assert from 'node:assert/strict';
import test from 'node:test';

import { EXPECTED_PACKAGE_FILES, verifyPackageFileSet } from '../../scripts/package-files.mjs';

test('package file guard accepts exactly the reviewed release files', () => {
  assert.doesNotThrow(() => verifyPackageFileSet([...EXPECTED_PACKAGE_FILES]));
});

test('package file guard rejects missing release files', () => {
  assert.throws(
    () => verifyPackageFileSet(EXPECTED_PACKAGE_FILES.filter((filePath) => filePath !== 'LICENSE')),
    /missing: LICENSE/
  );
});

test('package file guard rejects every unexpected or duplicate path', () => {
  assert.throws(
    () => verifyPackageFileSet([...EXPECTED_PACKAGE_FILES, 'app.js', 'package.json']),
    /unexpected: app\.js; duplicates: package\.json/
  );
});
