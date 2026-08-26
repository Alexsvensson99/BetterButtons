import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const css = await readFile(join(root, 'button-library.css'), 'utf8');

const groups = {
  themes: [
    'amber',
    'bronze',
    'coral',
    'crimson',
    'cyan',
    'emerald',
    'fuchsia',
    'gold',
    'indigo',
    'lavender',
    'lime',
    'midnight',
    'monochrome',
    'neon',
    'ocean',
    'rose',
    'slate',
    'sunset',
    'teal',
    'violet'
  ],
  styles: [
    'brutalist',
    'flat',
    'ghost',
    'glass',
    'gradient',
    'neon-style',
    'neumorphic',
    'outline',
    'pill-style',
    'raised',
    'soft',
    'solid'
  ],
  sizes: ['2xl', 'lg', 'md', 'sm', 'xl', 'xs'],
  shapes: ['circle', 'pill', 'rounded', 'square'],
  animations: ['bounce', 'fill', 'glow', 'none', 'pop', 'pulse', 'ripple', 'shake', 'shine', 'slide']
};

test('the public class API contains every documented dimension', () => {
  for (const [group, names] of Object.entries(groups)) {
    for (const name of names) {
      const prefix = group === 'animations' ? 'bb-anim-' : 'bb-';
      assert.match(css, new RegExp(`\\.${prefix}${name}(?:[\\s:{.,>]|$)`), `${group}: ${name}`);
    }
  }
});

test('all themes define the complete token contract', () => {
  const requiredTokens = [
    '--bb-primary',
    '--bb-primary-hover',
    '--bb-primary-active',
    '--bb-primary-text',
    '--bb-primary-light',
    '--bb-primary-dark',
    '--bb-primary-rgb',
    '--bb-primary-gradient'
  ];

  for (const theme of groups.themes) {
    const block = css.match(new RegExp(`\\.bb-${theme}\\s*\\{([^}]*)\\}`))?.[1];
    assert.ok(block, `Theme block missing: ${theme}`);
    for (const token of requiredTokens) assert.ok(block.includes(token), `${theme} is missing ${token}`);
  }
});

test('the combination claim is derived from the actual API', () => {
  const combinations =
    groups.themes.length *
    groups.styles.length *
    groups.sizes.length *
    groups.shapes.length *
    groups.animations.length;
  assert.equal(combinations, 57_600);
});

test('motion has an explicit user preference fallback', () => {
  assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)/);
  assert.match(css, /html\[data-reduced-motion=['"]true['"]\]/);
});
