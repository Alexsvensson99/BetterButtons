import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const css = await readFile(join(root, 'button-library.css'), 'utf8');
const themes = [...css.matchAll(/\.bb-([a-z]+)\s*\{([^}]+)\}/g)].filter(([, , block]) =>
  block.includes('--bb-primary:')
);

function token(block, name) {
  const value = block.match(new RegExp(`${name}:\\s*(#[0-9a-f]{3,6})`, 'i'))?.[1];
  assert.ok(value, `Missing hexadecimal ${name} token`);
  return value;
}

function luminance(hex) {
  const expanded = hex.length === 4 ? hex.replace(/([^#])/g, '$1$1') : hex;
  const channels = [1, 3, 5]
    .map((offset) => Number.parseInt(expanded.slice(offset, offset + 2), 16) / 255)
    .map((channel) => (channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4));
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function contrast(first, second) {
  const values = [luminance(first), luminance(second)].sort((a, b) => b - a);
  return (values[0] + 0.05) / (values[1] + 0.05);
}

test('solid theme colors meet WCAG AA contrast in every interaction state', () => {
  assert.equal(themes.length, 20);
  const failures = [];
  for (const [, theme, block] of themes) {
    const text = token(block, '--bb-primary-text');
    for (const state of ['--bb-primary', '--bb-primary-hover', '--bb-primary-active']) {
      const ratio = contrast(token(block, state), text);
      if (ratio < 4.5) failures.push(`${theme} ${state} is ${ratio.toFixed(2)}:1`);
    }
  }
  assert.deepEqual(failures, []);
});

test('soft and gradient theme surfaces meet WCAG AA contrast', () => {
  const failures = [];
  for (const [, theme, block] of themes) {
    const text = token(block, '--bb-primary-text');
    const softRatio = contrast(token(block, '--bb-primary-light'), token(block, '--bb-primary-dark'));
    if (softRatio < 4.5) failures.push(`${theme} soft is ${softRatio.toFixed(2)}:1`);

    const gradient = block.match(/--bb-primary-gradient:\s*([^;]+)/)?.[1] || '';
    const stops = [...gradient.matchAll(/#[0-9a-f]{3,6}/gi)].map(([color]) => color);
    assert.ok(stops.length >= 2, `${theme} gradient needs at least two hexadecimal stops`);
    for (const [index, stop] of stops.entries()) {
      const ratio = contrast(stop, text);
      if (ratio < 4.5) failures.push(`${theme} gradient stop ${index + 1} is ${ratio.toFixed(2)}:1`);
    }
  }
  assert.deepEqual(failures, []);
});
