import assert from 'node:assert/strict';
import test from 'node:test';

import { assertBrowserLaunchAllowed, runBrowserPreflight } from '../../scripts/playwright-preflight.mjs';

test('Codex seatbelt stops before launching a macOS browser', () => {
  assert.throws(
    () => assertBrowserLaunchAllowed({ platform: 'darwin', codexSandbox: 'seatbelt' }),
    /stopped before launching a browser/
  );
  assert.doesNotThrow(() => assertBrowserLaunchAllowed({ platform: 'darwin', codexSandbox: '' }));
  assert.doesNotThrow(() => assertBrowserLaunchAllowed({ platform: 'linux', codexSandbox: 'seatbelt' }));
});

test('browser preflight stops after the first launch failure', async () => {
  const events = [];
  const config = {
    projects: ['chromium', 'firefox', 'webkit'].map((browserName) => ({
      use: { browserName }
    }))
  };
  const launchers = {
    chromium: {
      async launch() {
        events.push('chromium:launch');
        return {
          async close() {
            events.push('chromium:close');
          }
        };
      }
    },
    firefox: {
      async launch() {
        events.push('firefox:launch');
        throw new Error('blocked by test');
      }
    },
    webkit: {
      async launch() {
        events.push('webkit:launch');
        return {
          async close() {
            events.push('webkit:close');
          }
        };
      }
    }
  };

  await assert.rejects(
    runBrowserPreflight(config, {
      launchers,
      environment: { platform: 'linux', codexSandbox: '' }
    }),
    /no tests were started[\s\S]*blocked by test/
  );
  assert.deepEqual(events, ['chromium:launch', 'chromium:close', 'firefox:launch']);
});
