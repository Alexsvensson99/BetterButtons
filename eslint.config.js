import js from '@eslint/js';
import globals from 'globals';

export default [
  {
    ignores: ['dist/**', 'node_modules/**', 'playwright-report/**', 'test-results/**']
  },
  js.configs.recommended,
  {
    files: ['app.js', 'theme-init.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      globals: globals.browser,
      sourceType: 'script'
    }
  },
  {
    files: ['*.config.js', '*.config.mjs', 'scripts/**/*.mjs', 'tests/**/*.mjs'],
    languageOptions: {
      ecmaVersion: 'latest',
      globals: globals.node,
      sourceType: 'module'
    }
  },
  {
    files: ['tests/browser/**/*.mjs', 'tests/visual/**/*.mjs'],
    languageOptions: {
      globals: { ...globals.node, ...globals.browser }
    }
  }
];
