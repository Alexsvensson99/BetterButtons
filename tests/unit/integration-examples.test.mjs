import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const frameworkFiles = ['react.md', 'vue.md', 'svelte.md'];

test('framework examples import the package and preserve accessible loading semantics', async () => {
  for (const file of frameworkFiles) {
    const source = await readFile(join(root, 'examples', 'frameworks', file), 'utf8');
    assert.match(source, /import 'betterbuttons';/, `${file} must import the package stylesheet`);
    assert.match(source, /type="button"/, `${file} must use a native button type`);
    assert.match(source, /bb-loading/, `${file} must demonstrate the loading utility`);
    assert.match(source, /disabled/, `${file} must expose the native disabled state`);
    assert.match(source, /aria-busy/, `${file} must expose the busy state`);
    assert.match(source, /Save changes/, `${file} must keep a useful label in the DOM`);
  }
});

test('the RTL example provides semantic grouped, split, badge and loading controls', async () => {
  const html = await readFile(join(root, 'examples', 'rtl.html'), 'utf8');
  assert.match(html, /<html lang="ar" dir="rtl">/);
  for (const className of ['bb-group', 'bb-split', 'bb-badge', 'bb-loading']) {
    assert.match(html, new RegExp(`\\b${className}\\b`), `RTL example is missing ${className}`);
  }
  assert.equal([...html.matchAll(/role="group"/g)].length, 2);
  const buttons = [...html.matchAll(/<button\b[^>]*>/g)].map((match) => match[0]);
  assert.ok(buttons.length >= 6);
  for (const button of buttons) assert.match(button, /\btype="button"/);
  assert.doesNotMatch(
    html,
    /\bdirection\s*:/,
    'Document direction must come from the semantic dir attribute'
  );
});
