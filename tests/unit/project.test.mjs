import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const requiredFiles = [
  '.github/workflows/ci.yml',
  '.github/workflows/publish.yml',
  'CODE_OF_CONDUCT.md',
  'CONTRIBUTING.md',
  'LICENSE',
  'README.md',
  'SECURITY.md',
  'app.js',
  'button-library.css',
  'docs/VISUAL_TESTING.md',
  'favicon.svg',
  'index.html',
  'package.json',
  'playwright.visual.config.mjs',
  'tests/visual/screenshot.css',
  'tests/visual/showcase.visual.spec.mjs',
  'theme-init.js'
];
const html = await readFile(join(root, 'index.html'), 'utf8');
const app = await readFile(join(root, 'app.js'), 'utf8');
const ciWorkflow = await readFile(join(root, '.github/workflows/ci.yml'), 'utf8');
const publishWorkflow = await readFile(join(root, '.github/workflows/publish.yml'), 'utf8');
const packageJson = JSON.parse(await readFile(join(root, 'package.json'), 'utf8'));

test('the repository includes baseline open-source files', async () => {
  await Promise.all(requiredFiles.map((file) => access(join(root, file))));
});

test('package metadata is publishable and traceable', () => {
  assert.equal(packageJson.name, 'betterbuttons');
  assert.match(packageJson.version, /^\d+\.\d+\.\d+$/);
  assert.equal(packageJson.license, 'MIT');
  assert.equal(packageJson.private, undefined, 'The reviewed release package must remain publishable');
  assert.equal(packageJson.repository.url, 'git+https://github.com/Alexsvensson99/BetterButtons.git');
  assert.equal(packageJson.exports['.'], './dist/betterbuttons.css');
  assert.deepEqual(packageJson.sideEffects, ['*.css', 'dist/*.css']);
  assert.equal(packageJson.scripts['test:visual'], 'playwright test --config=playwright.visual.config.mjs');
});

test('npm publication is manual, tag-bound and provenance-enabled', () => {
  assert.match(publishWorkflow, /workflow_dispatch:/);
  assert.match(publishWorkflow, /expected_sha256:/);
  assert.match(publishWorkflow, /id-token: write/);
  assert.match(publishWorkflow, /name: npm-production/);
  assert.match(publishWorkflow, /startsWith\(github\.ref, 'refs\/tags\/v'\)/);
  assert.match(publishWorkflow, /BETTERBUTTONS_PUBLISH: \$\{\{ github\.ref_name \}\}/);
  assert.match(publishWorkflow, /npm publish "\.\/\$TARBALL" --access public --provenance --ignore-scripts/);
  assert.doesNotMatch(publishWorkflow, /NODE_AUTH_TOKEN|NPM_TOKEN|\bsecrets\./);
  assert.doesNotMatch(publishWorkflow, /pull_request:/);
  assert.doesNotMatch(publishWorkflow, /^\s+push:/m);
});

test('continuous integration is public-runner safe', () => {
  assert.match(ciWorkflow, /permissions:\s*\n\s+contents: read/);
  assert.equal([...ciWorkflow.matchAll(/^\s+runs-on: ubuntu-24\.04$/gm)].length, 2);
  assert.doesNotMatch(ciWorkflow, /\bself-hosted\b/);
  assert.doesNotMatch(ciWorkflow, /betterbuttons-private/);
  assert.doesNotMatch(ciWorkflow, /pull_request_target:/);
  assert.doesNotMatch(ciWorkflow, /\bsecrets\./);

  const actionLines = ciWorkflow.match(/^\s+uses:.*$/gm) ?? [];
  assert.ok(actionLines.length > 0, 'CI must use at least one action');
  for (const line of actionLines) {
    assert.match(line, /@[0-9a-f]{40}(?:\s+#.*)?$/, `Action is not pinned to a commit: ${line.trim()}`);
  }
});

test('showcase ids and internal links are valid', () => {
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
  assert.equal(new Set(ids).size, ids.length, 'Duplicate HTML ids found');
  for (const [, target] of html.matchAll(/href="#([^"]+)"/g)) {
    assert.ok(ids.includes(target), `Internal link target is missing: #${target}`);
  }
});

test('the builder exposes the complete documented matrix', () => {
  assert.equal([...html.matchAll(/data-control="theme"/g)].length, 20);
  assert.equal([...html.matchAll(/data-control="style"/g)].length, 12);
  assert.equal([...html.matchAll(/data-control="animation"/g)].length, 10);
  assert.equal([...html.matchAll(/<option value="bb-(?:xs|sm|md|lg|xl|2xl)"/g)].length, 6);
  assert.equal([...html.matchAll(/<option value="bb-(?:rounded|pill|square|circle)"/g)].length, 4);
});

test('the saved theme is applied before showcase styles load', () => {
  assert.ok(html.indexOf('theme-init.js') > 0);
  assert.ok(html.indexOf('theme-init.js') < html.indexOf('styles.css'));
});

test('every static button has an explicit type', () => {
  const buttons = [...html.matchAll(/<button\b[^>]*>/g)].map((match) => match[0]);
  assert.ok(buttons.length > 0);
  for (const button of buttons) assert.match(button, /\btype="(?:button|submit|reset)"/);
});

test('legacy branding is gone and generated buttons are safe in forms', () => {
  assert.doesNotMatch(html, /MegaButtons/i);
  assert.match(app, /type="button"/);
  assert.match(app, /escapeHtml/);
});
