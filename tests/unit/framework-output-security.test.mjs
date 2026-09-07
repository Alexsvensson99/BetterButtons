import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { runInNewContext } from 'node:vm';

import { transform } from 'esbuild';
import * as React from 'react';
import * as reactJsxRuntime from 'react/jsx-runtime';
import { renderToStaticMarkup } from 'react-dom/server';
import { compile as compileSvelte } from 'svelte/compiler';
import * as svelteInternalServer from 'svelte/internal/server';
import { render as renderSvelteComponent } from 'svelte/server';
import * as Vue from 'vue';
import { compileScript, parse as parseVueSfc } from 'vue/compiler-sfc';
import { renderToString as renderVueToString } from 'vue/server-renderer';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const builderOutputSource = await readFile(join(root, 'builder-output.js'), 'utf8');
const builderContext = {};
runInNewContext(builderOutputSource, builderContext, { filename: 'builder-output.js' });
const { createButtonMarkup } = builderContext.BetterButtonsBuilderOutput;

function renderedText(html) {
  return html
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<[^>]*>/g, '')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
    .replaceAll('&#x27;', "'")
    .replaceAll('&amp;', '&')
    .trim();
}

async function evaluateCommonJs(source, { dependencies, loader = 'js' }) {
  const { code } = await transform(source, {
    format: 'cjs',
    jsx: 'automatic',
    loader,
    target: 'node22'
  });
  const module = { exports: {} };
  const context = {
    __bbProbe: 0,
    exports: module.exports,
    module,
    require(specifier) {
      assert.ok(specifier in dependencies, `Unexpected compiled dependency: ${specifier}`);
      return dependencies[specifier];
    }
  };
  runInNewContext(code, context, { timeout: 5_000 });
  return { context, exports: module.exports };
}

async function renderReact(source) {
  const evaluated = await evaluateCommonJs(source, {
    dependencies: {
      betterbuttons: {},
      'react/jsx-runtime': reactJsxRuntime
    },
    loader: 'jsx'
  });
  return {
    html: renderToStaticMarkup(React.createElement(evaluated.exports.BetterButton)),
    probe: evaluated.context.__bbProbe
  };
}

async function renderVue(source) {
  const { descriptor, errors } = parseVueSfc(source, { filename: 'BetterButton.vue' });
  assert.deepEqual(errors, []);
  const compiled = compileScript(descriptor, {
    id: 'betterbuttons-security-test',
    inlineTemplate: true
  });
  const evaluated = await evaluateCommonJs(compiled.content, {
    dependencies: {
      betterbuttons: {},
      vue: Vue
    }
  });
  return {
    html: await renderVueToString(Vue.createSSRApp(evaluated.exports.default)),
    probe: evaluated.context.__bbProbe
  };
}

async function renderSvelte(source) {
  const compiled = compileSvelte(source, {
    filename: 'BetterButton.svelte',
    generate: 'server'
  });
  const evaluated = await evaluateCommonJs(compiled.js.code, {
    dependencies: {
      betterbuttons: {},
      'svelte/internal/server': svelteInternalServer
    }
  });
  return {
    html: renderSvelteComponent(evaluated.exports.default).body,
    probe: evaluated.context.__bbProbe
  };
}

const frameworkCases = [
  {
    format: 'react',
    hostileLabel: '{globalThis.__bbProbe=1}',
    render: renderReact,
    safeBinding: '{label}'
  },
  {
    format: 'vue',
    hostileLabel: '{{globalThis.__bbProbe=1}}',
    render: renderVue,
    safeBinding: '{{ label }}'
  },
  {
    format: 'svelte',
    hostileLabel: '{globalThis.__bbProbe=1}',
    render: renderSvelte,
    safeBinding: '{label}'
  }
];

for (const { format, hostileLabel, render, safeBinding } of frameworkCases) {
  test(`${format} output compiles and renders hostile labels as inert text`, async () => {
    const source = createButtonMarkup(
      {
        direction: 'rtl',
        label: hostileLabel,
        loading: true
      },
      format
    );

    assert.ok(hostileLabel.length <= 28, 'Keep the security probe within the builder limit');
    assert.match(source, /const label = ["']/);
    assert.ok(source.includes(safeBinding));
    const rendered = await render(source);

    assert.ok(rendered.html.includes(hostileLabel), rendered.html);
    assert.match(rendered.html, /class="[^"]*bb-loading/);
    assert.match(rendered.html, /dir="rtl"/);
    assert.match(rendered.html, /aria-busy="true"/);
    assert.match(rendered.html, /disabled/);
    assert.equal(rendered.probe, 0);
  });

  test(`${format} output keeps hostile circle labels in the accessible name`, async () => {
    const source = createButtonMarkup(
      {
        label: hostileLabel,
        shape: 'bb-circle'
      },
      format
    );
    const rendered = await render(source);

    assert.ok(rendered.html.includes(`aria-label="${hostileLabel}"`), rendered.html);
    assert.doesNotMatch(rendered.html, />\s*\{?\{?globalThis/);
    assert.equal(rendered.probe, 0);
  });

  test(`${format} output preserves quotes, backslashes, braces and Unicode`, async () => {
    const label = `"'\\ {x} {{x}} e\u0301🚀`;
    assert.ok(label.length <= 28);
    const rendered = await render(createButtonMarkup({ label }, format));

    assert.equal(renderedText(rendered.html), label);
    assert.equal(rendered.probe, 0);
  });
}

test('framework string literals cannot terminate Vue or Svelte script blocks', async () => {
  const label = '</script><script>globalThis.__bbProbe=1</script>\u2028\u2029e\u0301🚀';

  for (const { format, render } of frameworkCases) {
    const source = createButtonMarkup({ label }, format);
    const labelDeclaration = source.match(/^\s*const label = .*;$/m)?.[0] || '';

    assert.ok(labelDeclaration.includes('\\u003C/script\\u003E'));
    assert.ok(labelDeclaration.includes('\\u2028'));
    assert.ok(labelDeclaration.includes('\\u2029'));
    assert.ok(!labelDeclaration.includes('</script>'));
    const rendered = await render(source);
    assert.equal(rendered.probe, 0);
    assert.equal(renderedText(rendered.html), label);
    assert.ok(rendered.html.includes('&lt;/script'));
    assert.ok(!rendered.html.includes('<script>globalThis'));
  }
});

test('HTML output uses context-specific text and attribute escaping', () => {
  const label = '<img src=x onerror="globalThis.__bbProbe=1"> & "quotes"';
  const visible = createButtonMarkup({ label }, 'html');
  const circle = createButtonMarkup({ label, shape: 'bb-circle' }, 'html');

  assert.ok(visible.includes('&lt;img src=x onerror="globalThis.__bbProbe=1"&gt;'));
  assert.ok(!visible.includes('<img'));
  assert.ok(circle.includes('onerror=&quot;globalThis.__bbProbe=1&quot;'));
  assert.ok(!circle.includes('<img'));
});
