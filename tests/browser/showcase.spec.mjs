import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('the showcase has no automatically detectable accessibility violations', async ({ page }) => {
  const violations = [];
  for (const theme of ['dark', 'light']) {
    await page.evaluate((value) => localStorage.setItem('betterbuttons-theme', value), theme);
    await page.reload();
    const themeSurface = await page.evaluate(() => ({
      backgroundColor: getComputedStyle(document.documentElement).backgroundColor,
      backgroundImage: getComputedStyle(document.body).backgroundImage
    }));
    expect(themeSurface.backgroundColor).toBe(theme === 'dark' ? 'rgb(11, 14, 19)' : 'rgb(245, 247, 250)');
    expect(themeSurface.backgroundImage).not.toBe('none');
    const results = await new AxeBuilder({ page }).analyze();
    violations.push(
      ...results.violations.map(({ id, impact, nodes }) => ({
        theme,
        id,
        impact,
        nodes: nodes.map((node) => ({
          target: node.target.join(' '),
          reasons: node.any.map(({ message }) => message)
        }))
      }))
    );
  }
  expect(violations).toEqual([]);
});

test('the builder updates preview and copy-ready HTML', async ({ page }) => {
  await page.getByLabel('Button label').fill('Ship safely');
  await page.getByRole('button', { name: 'Gradient', exact: true }).click();
  await page.getByLabel('Lifted shadow').check();
  await page.getByLabel('Loading state').check();
  await page.getByLabel('Full width').check();

  const preview = page.locator('#builder-preview-button');
  await expect(preview).toHaveText(/Ship safely/);
  await expect(preview).toHaveClass(/bb-gradient/);
  await expect(preview).toHaveClass(/bb-shadow/);
  await expect(preview).toHaveClass(/bb-loading/);
  await expect(preview).toHaveClass(/bb-block/);
  await expect(preview).toBeDisabled();
  await expect(preview).toHaveAttribute('aria-busy', 'true');

  const output = page.locator('#code-output');
  await expect(output).toContainText('type="button"');
  await expect(output).toContainText('bb-gradient');
  await expect(output).toContainText('bb-shadow');
  await expect(output).toContainText('bb-loading');
  await expect(output).toContainText('bb-block');
  await expect(output).toContainText('aria-busy="true"');
  await expect(output).toContainText('disabled');
  await expect(output).toContainText('Ship safely');
});

test('circle output becomes an accessible icon-only button', async ({ page }) => {
  await page.getByLabel('Button label').fill('Continue');
  await page.getByLabel('Button shape').selectOption('bb-circle');

  const preview = page.locator('#builder-preview-button');
  await expect(preview).toHaveClass(/bb-circle/);
  await expect(preview).toHaveClass(/bb-icon-only/);
  await expect(preview.locator('.preview-label')).toHaveCount(0);
  await expect(page.locator('#code-output')).toContainText('aria-label="Continue"');
});

test('the builder previews and exports right-to-left direction', async ({ page }) => {
  await page.getByRole('button', { name: 'Right to left', exact: true }).click();

  const preview = page.locator('#builder-preview-button');
  await expect(preview).toHaveAttribute('dir', 'rtl');
  await expect(page.locator('#code-output')).toContainText('dir="rtl"');
  await expect(page.getByRole('button', { name: 'Right to left', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true'
  );
});

test('the builder exports accessible HTML, React, Vue and Svelte markup', async ({ page }) => {
  await page.getByLabel('Button label').fill('Save changes');
  await page.getByRole('button', { name: 'Right to left', exact: true }).click();
  await page.getByLabel('Loading state').check();

  const output = page.locator('#code-output');
  await expect(output).toContainText('class="bb-btn');
  await expect(output).toContainText('aria-busy="true"');
  await expect(output).toContainText('disabled');

  await page.getByRole('button', { name: 'React / JSX', exact: true }).click();
  await expect(output).toContainText("import 'betterbuttons';");
  await expect(output).toContainText('export function BetterButton()');
  await expect(output).toContainText('className="bb-btn');
  await expect(output).toContainText('dir="rtl"');

  await page.getByRole('button', { name: 'Vue', exact: true }).click();
  await expect(output).toContainText('<script setup>');
  await expect(output).toContainText('<template>');
  await expect(output).toContainText('class="bb-btn');

  await page.getByRole('button', { name: 'Svelte', exact: true }).click();
  await expect(output).toContainText('<script>');
  await expect(output).toContainText("import 'betterbuttons';");
  await expect(output).toContainText('Save changes');
  await expect(page.locator('#output-title')).toHaveText('Svelte output');
});

test('share links restore a validated complete builder configuration', async ({ page }) => {
  await page.evaluate(() => window.history.replaceState(null, '', '/?campaign=local-preview'));
  await page.evaluate(() => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: async (value) => {
          window.__betterButtonsCopiedText = value;
        }
      }
    });
  });
  await page.getByLabel('Button label').fill('مرحبا');
  await page.getByLabel('Violet theme').click();
  await page.getByRole('button', { name: 'Gradient', exact: true }).click();
  await page.getByLabel('Button size').selectOption('bb-xl');
  await page.getByRole('button', { name: 'Right to left', exact: true }).click();
  await page.getByLabel('Lifted shadow').check();
  await page.getByRole('button', { name: 'React / JSX', exact: true }).click();
  await page.getByRole('button', { name: 'Copy share link', exact: true }).click();

  const shareUrl = await page.evaluate(() => window.__betterButtonsCopiedText);
  expect(shareUrl).toContain('#builder?');
  expect(shareUrl).toContain('v=1');
  expect(new URL(shareUrl).search).toBe('');
  await page.goto(shareUrl);
  await page.reload();

  const preview = page.locator('#builder-preview-button');
  await expect(preview).toHaveText(/مرحبا/);
  await expect(preview).toHaveClass(/bb-violet/);
  await expect(preview).toHaveClass(/bb-gradient/);
  await expect(preview).toHaveClass(/bb-xl/);
  await expect(preview).toHaveClass(/bb-shadow/);
  await expect(preview).toHaveAttribute('dir', 'rtl');
  await expect(page.getByRole('button', { name: 'React / JSX', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true'
  );
  await expect(page.locator('#copy-status')).toHaveText('Shared configuration loaded.');

  await page.getByLabel('Button size').selectOption('bb-sm');
  await expect(page).toHaveURL(/#builder$/);
});

test('share links reject unknown classes and escape shared labels', async ({ page }) => {
  const parameters = new URLSearchParams({
    v: '1',
    theme: 'bb-injected',
    style: 'bb-solid',
    size: 'bb-lg',
    shape: 'bb-pill',
    direction: 'ltr',
    animation: 'bb-anim-none',
    format: 'html',
    shadow: '0',
    loading: '0',
    block: '0',
    motionReduced: '0',
    label: '<img src=x onerror=alert(1)>'
  });
  await page.goto(`/#builder?${parameters}`);
  await page.reload();

  const preview = page.locator('#builder-preview-button');
  await expect(preview).toHaveClass(/bb-ocean/);
  await expect(preview).not.toHaveClass(/bb-injected/);
  await expect(page.locator('#code-output')).toContainText('&lt;img src=x onerror=alert(1)&gt;');
  await expect(page.locator('#code-output img')).toHaveCount(0);
});

test('framework exports keep shared labels inert instead of creating expressions', async ({ page }) => {
  const cases = [
    {
      binding: '{label}',
      format: 'react',
      label: '{globalThis.__bbProbe=1}'
    },
    {
      binding: '{{ label }}',
      format: 'vue',
      label: '{{globalThis.__bbProbe=1}}'
    },
    {
      binding: '{label}',
      format: 'svelte',
      label: '{globalThis.__bbProbe=1}'
    }
  ];

  for (const { binding, format, label } of cases) {
    const parameters = new URLSearchParams({
      v: '1',
      format,
      label
    });
    await page.goto(`/#builder?${parameters}`);
    await page.reload();

    await expect(page.locator('#builder-preview-button')).toContainText(label);
    const output = await page.locator('#code-output').textContent();
    expect(output).toContain(`const label = ${JSON.stringify(label)};`);
    expect(output).toContain(binding);
    expect(output).not.toContain(`${label} <span`);
    expect(await page.evaluate(() => globalThis.__bbProbe)).toBeUndefined();
  }
});

test('explicit shapes have stable priority over style geometry', async ({ page }) => {
  await page.getByRole('button', { name: 'Flat', exact: true }).click();
  await page.getByLabel('Button shape').selectOption('bb-pill');
  await expect(page.locator('#builder-preview-button')).toHaveCSS('border-radius', '999px');

  await page.getByRole('button', { name: 'Brutalist', exact: true }).click();
  await page.getByLabel('Button shape').selectOption('bb-circle');
  await expect(page.locator('#builder-preview-button')).toHaveCSS('border-radius', '50%');
});

test('library search and category filters compose correctly', async ({ page }) => {
  await page.locator('#button-search').fill('glass');
  await expect(page.locator('[data-style-card]:visible')).toHaveCount(1);
  await expect(page.locator('[data-style-card]:visible')).toContainText('Glass');

  await page.getByRole('button', { name: 'Core', exact: true }).click();
  await expect(page.locator('[data-style-card]:visible')).toHaveCount(0);
  await expect(page.locator('#gallery-empty')).toBeVisible();
});

test('theme preference survives reload', async ({ page }) => {
  const startedLight = await page
    .locator('html')
    .evaluate((element) => element.classList.contains('theme-light'));
  await page.locator('#theme-toggle').click();
  if (startedLight) await expect(page.locator('html')).not.toHaveClass(/theme-light/);
  else await expect(page.locator('html')).toHaveClass(/theme-light/);
  await page.reload();
  if (startedLight) await expect(page.locator('html')).not.toHaveClass(/theme-light/);
  else await expect(page.locator('html')).toHaveClass(/theme-light/);
});

test('keyboard operation and reduced-motion preferences are respected', async ({ page, browserName }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.reload();

  const focusForward = browserName === 'webkit' && process.platform === 'darwin' ? 'Alt+Tab' : 'Tab';
  await page.keyboard.press(focusForward);
  await expect(page.locator('.skip-link')).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#main-content$/);

  const gradient = page.getByRole('button', { name: 'Gradient', exact: true });
  await gradient.focus();
  await page.keyboard.press('Space');
  await expect(gradient).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('html')).toHaveCSS('scroll-behavior', 'auto');
  await expect(page.locator('#builder-preview-button')).toHaveCSS('transition-duration', '0s');
});

test('forced-colors mode keeps native adjustment and focus treatment', async ({ page, browserName }) => {
  test.skip(browserName !== 'chromium', 'Forced-colors emulation is verified in Chromium.');
  await page.emulateMedia({ forcedColors: 'active' });
  await page.reload();
  const preview = page.locator('#builder-preview-button');
  await preview.focus();
  await expect(preview).toHaveCSS('forced-color-adjust', 'auto');
  await expect(preview).toHaveCSS('outline-style', 'solid');

  await page.goto('/examples/rtl.html');
  const loading = page.locator('.bb-loading');
  const badge = page.locator('.bb-badge');
  await expect(loading).toHaveCSS('opacity', '1');
  await expect(badge).toHaveCSS('forced-color-adjust', 'auto');
  await expect(badge).toHaveCSS('border-top-style', 'solid');
});

test('the built quick-start example works as a standalone integration', async ({ page }) => {
  await page.goto('/examples/quick-start.html');
  await expect(page.locator('.bb-btn')).toHaveCount(3);
  await expect(page.locator('.bb-btn').first()).toHaveCSS('position', 'relative');
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);

  await page.setViewportSize({ width: 390, height: 844 });
  const dimensions = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth
  }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
});

test('the RTL example mirrors logical group edges and remains accessible', async ({ page }) => {
  await page.goto('/examples/rtl.html');
  const groupButtons = page.locator('.bb-group > .bb-btn');
  const first = groupButtons.first();
  const last = groupButtons.last();
  const firstBox = await first.boundingBox();
  const lastBox = await last.boundingBox();
  expect(firstBox.x).toBeGreaterThan(lastBox.x);
  await expect(first).toHaveCSS('border-top-right-radius', '12px');
  await expect(first).toHaveCSS('border-top-left-radius', '0px');
  await expect(last).toHaveCSS('border-top-left-radius', '12px');
  await expect(last).toHaveCSS('border-top-right-radius', '0px');

  const badgeButtonBox = await page.locator('.bb-badge').locator('..').boundingBox();
  const badgeBox = await page.locator('.bb-badge').boundingBox();
  expect(badgeBox.x).toBeLessThan(badgeButtonBox.x);

  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});

test('mobile navigation works without horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const menu = page.locator('#menu-toggle');
  await expect(menu).toBeVisible();
  await menu.click();
  await expect(page.locator('#primary-nav')).toBeVisible();
  await expect(menu).toHaveAttribute('aria-expanded', 'true');

  const dimensions = await page.evaluate(() => {
    const viewportWidth = document.documentElement.clientWidth;
    const selectors = [
      '#menu-toggle',
      '.hero-copy',
      '.hero-actions .bb-btn',
      '.hero-metrics',
      '.hero-visual',
      '.feature-band'
    ];
    return {
      clientWidth: viewportWidth,
      scrollWidth: document.documentElement.scrollWidth,
      outsideViewport: selectors.filter((selector) => {
        const bounds = document.querySelector(selector)?.getBoundingClientRect();
        return !bounds || bounds.left < -1 || bounds.right > viewportWidth + 1;
      })
    };
  });
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
  expect(dimensions.outsideViewport).toEqual([]);
});
