export const EXPECTED_PACKAGE_FILES = Object.freeze([
  'LICENSE',
  'README.md',
  'button-library.css',
  'dist/betterbuttons.css',
  'dist/betterbuttons.min.css',
  'dist/manifest.json',
  'package.json'
]);

export function verifyPackageFileSet(filePaths) {
  const expected = new Set(EXPECTED_PACKAGE_FILES);
  const actual = new Set(filePaths);
  const missing = EXPECTED_PACKAGE_FILES.filter((filePath) => !actual.has(filePath));
  const unexpected = [...actual].filter((filePath) => !expected.has(filePath)).sort();
  const duplicates = [...actual]
    .filter((filePath) => filePaths.filter((candidate) => candidate === filePath).length > 1)
    .sort();

  if (missing.length === 0 && unexpected.length === 0 && duplicates.length === 0) return;

  const details = [];
  if (missing.length > 0) details.push(`missing: ${missing.join(', ')}`);
  if (unexpected.length > 0) details.push(`unexpected: ${unexpected.join(', ')}`);
  if (duplicates.length > 0) details.push(`duplicates: ${duplicates.join(', ')}`);
  throw new Error(`Packed file set does not match the release allowlist (${details.join('; ')}).`);
}
