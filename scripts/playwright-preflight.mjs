import { chromium, firefox, webkit } from '@playwright/test';

const browserTypes = { chromium, firefox, webkit };

function errorMessage(error) {
  return error instanceof Error ? error.message : String(error);
}

export function assertBrowserLaunchAllowed({
  platform = process.platform,
  codexSandbox = process.env.CODEX_SANDBOX ?? ''
} = {}) {
  if (platform === 'darwin' && codexSandbox === 'seatbelt') {
    throw new Error(
      [
        'Playwright was stopped before launching a browser.',
        'The Codex macOS seatbelt sandbox cannot register these GUI browser processes safely.',
        'Rerun the command with browser/GUI process permission outside the sandbox.'
      ].join(' ')
    );
  }
}

function launchTargets(config) {
  const targets = [];
  const seen = new Set();

  for (const project of config.projects) {
    const browserName = project.use.browserName;
    if (!browserName || !browserTypes[browserName]) continue;

    const options = {
      ...(project.use.launchOptions ?? {}),
      headless: project.use.headless ?? true
    };
    if (project.use.channel) options.channel = project.use.channel;

    const key = JSON.stringify({ browserName, options });
    if (seen.has(key)) continue;
    seen.add(key);
    targets.push({ browserName, options });
  }

  return targets;
}

export async function runBrowserPreflight(config, { launchers = browserTypes, environment } = {}) {
  assertBrowserLaunchAllowed(environment);

  for (const { browserName, options } of launchTargets(config)) {
    let browser;
    try {
      browser = await launchers[browserName].launch(options);
    } catch (error) {
      throw new Error(
        [
          `Playwright browser preflight failed for ${browserName}; no tests were started.`,
          'If this is Codex on macOS, rerun with browser/GUI process permission outside the sandbox.',
          `Original error: ${errorMessage(error)}`
        ].join('\n'),
        { cause: error }
      );
    } finally {
      await browser?.close();
    }
  }
}

export default runBrowserPreflight;
