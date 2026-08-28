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
