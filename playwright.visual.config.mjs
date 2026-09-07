import { defineConfig } from '@playwright/test';
import { fileURLToPath } from 'node:url';
import { assertBrowserLaunchAllowed } from './scripts/playwright-preflight.mjs';

const screenshotStylePath = fileURLToPath(new URL('./tests/visual/screenshot.css', import.meta.url));

assertBrowserLaunchAllowed();

export default defineConfig({
  testDir: './tests/visual',
  globalSetup: './scripts/playwright-preflight.mjs',
  outputDir: './test-results/visual',
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  workers: 1,
  reporter: 'line',
  snapshotPathTemplate: '{testDir}/__screenshots__/{platform}/{testFileBaseName}/{arg}{ext}',
  expect: {
    timeout: 10_000,
    toHaveScreenshot: {
      animations: 'disabled',
      caret: 'hide',
      maxDiffPixels: 150,
      threshold: 0.2,
      stylePath: screenshotStylePath
    }
  },
  projects: [
    {
      name: 'visual-chromium',
      use: { browserName: 'chromium' }
    }
  ],
  use: {
    baseURL: 'http://127.0.0.1:4173',
    deviceScaleFactor: 1,
    headless: true,
    locale: 'en-US',
    reducedMotion: 'reduce',
    screenshot: 'only-on-failure',
    serviceWorkers: 'block',
    timezoneId: 'UTC',
    trace: 'retain-on-failure',
    viewport: { width: 1440, height: 1000 }
  },
  webServer: {
    command: 'node scripts/serve.mjs',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 15_000
  }
});
