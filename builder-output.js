(function exposeBuilderOutput(globalScope) {
  'use strict';

  const DEFAULT_CONFIGURATION = Object.freeze({
    theme: 'bb-ocean',
    style: 'bb-solid',
    size: 'bb-lg',
    shape: 'bb-pill',
    direction: 'ltr',
    animation: 'bb-anim-shine',
    shadow: false,
    loading: false,
    block: false,
    motionReduced: false,
    format: 'html',
    label: 'Make it better'
  });
  const ARROW_ICON = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h9M8 4l4 4-4 4"></path></svg>';

  function escapeHtmlText(value) {
    return String(value).replace(
      /[&<>]/g,
      (character) =>
        ({
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;'
        })[character]
    );
  }

  function escapeHtmlAttribute(value) {
    return String(value).replace(
      /[&<>'"]/g,
      (character) =>
        ({
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          "'": '&#39;',
          '"': '&quot;'
        })[character]
    );
  }

  function serializeJavaScriptString(value) {
    return JSON.stringify(String(value))
      .replaceAll('<', '\\u003C')
      .replaceAll('>', '\\u003E')
      .replaceAll('&', '\\u0026')
      .replaceAll('\u2028', '\\u2028')
      .replaceAll('\u2029', '\\u2029');
  }

  function normalizeConfiguration(configuration = {}) {
    return { ...DEFAULT_CONFIGURATION, ...configuration };
  }

  function configuredLabel(configuration) {
    return String(configuration.label ?? '').trim() || 'Button';
  }

  function collectClasses(configuration) {
    const classes = [
      'bb-btn',
      configuration.theme,
      configuration.style,
      configuration.size,
      configuration.shape,
      configuration.animation
    ];
    if (configuration.shape === 'bb-circle') classes.push('bb-icon-only');
    if (configuration.shadow) classes.push('bb-shadow');
    if (configuration.loading) classes.push('bb-loading');
    if (configuration.block && configuration.shape !== 'bb-circle') classes.push('bb-block');
    return classes;
  }

  function currentClasses(configuration = {}) {
    return collectClasses(normalizeConfiguration(configuration));
  }

  function labelBinding(format, label) {
    if (format === 'html') return escapeHtmlText(label);
    if (format === 'vue') return '{{ label }}';
    return '{label}';
  }

  function accessibleNameBinding(format, label) {
    if (format === 'html') return `aria-label="${escapeHtmlAttribute(label)}"`;
    if (format === 'vue') return ':aria-label="label"';
    return 'aria-label={label}';
  }

  function baseButtonMarkup(configuration, format) {
    const label = configuredLabel(configuration);
    const classAttribute = format === 'react' ? 'className' : 'class';
    const attributes = ['type="button"', `${classAttribute}="${collectClasses(configuration).join(' ')}"`];
    if (configuration.direction === 'rtl') attributes.push('dir="rtl"');
    if (configuration.shape === 'bb-circle') {
      attributes.push(accessibleNameBinding(format, label));
    }
    if (configuration.loading) attributes.push('aria-busy="true"', 'disabled');
    const content =
      configuration.shape === 'bb-circle'
        ? `<span ${classAttribute}="bb-btn-icon" aria-hidden="true">${ARROW_ICON}</span>`
        : `${labelBinding(format, label)} <span ${classAttribute}="bb-btn-icon" aria-hidden="true">${ARROW_ICON}</span>`;
    return `<button ${attributes.join(' ')}>\n  ${content}\n</button>`;
  }

  function indentMarkup(markup, spaces) {
    const indentation = ' '.repeat(spaces);
    return markup
      .split('\n')
      .map((line) => `${indentation}${line}`)
      .join('\n');
  }

  function createButtonMarkup(configuration = {}, requestedFormat) {
    const normalized = normalizeConfiguration(configuration);
    const format = requestedFormat || normalized.format;
    const labelLiteral = serializeJavaScriptString(configuredLabel(normalized));

    if (format === 'react') {
      return `import 'betterbuttons';\n\nconst label = ${labelLiteral};\n\nexport function BetterButton() {\n  return (\n${indentMarkup(
        baseButtonMarkup(normalized, format),
        4
      )}\n  );\n}`;
    }
    if (format === 'vue') {
      return `<script setup>\nimport 'betterbuttons';\n\nconst label = ${labelLiteral};\n</script>\n\n<template>\n${indentMarkup(
        baseButtonMarkup(normalized, format),
        2
      )}\n</template>`;
    }
    if (format === 'svelte') {
      return `<script>\n  import 'betterbuttons';\n\n  const label = ${labelLiteral};\n</script>\n\n${baseButtonMarkup(
        normalized,
        format
      )}`;
    }
    return baseButtonMarkup(normalized, 'html');
  }

  globalScope.BetterButtonsBuilderOutput = Object.freeze({
    ARROW_ICON,
    DEFAULT_CONFIGURATION,
    createButtonMarkup,
    currentClasses
  });
})(globalThis);
