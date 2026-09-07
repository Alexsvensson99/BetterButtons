import { expect, test } from '@playwright/test';

const desktop = { width: 1440, height: 1000 };
const mobile = { width: 390, height: 844 };

async function openShowcase(page, { theme = 'dark', viewport = desktop, forcedColors = 'none' } = {}) {
  await page.setViewportSize(viewport);
  await page.emulateMedia({
    colorScheme: theme,
    forcedColors,
    reducedMotion: 'reduce'
  });
  await page.addInitScript((selectedTheme) => {
    localStorage.setItem('betterbuttons-theme', selectedTheme);
  }, theme);
  await page.goto('/', { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator('#main-content')).toBeVisible();

  if (theme === 'light') await expect(page.locator('html')).toHaveClass(/theme-light/);
  else await expect(page.locator('html')).not.toHaveClass(/theme-light/);
}

test('desktop dark launch surface remains stable', async ({ page }) => {
  await openShowcase(page);
  await page.evaluate(() => window.scrollTo(0, 0));

  await expect(page).toHaveScreenshot('desktop-dark-overview.png');
});

test('desktop light gallery remains stable', async ({ page }) => {
  await openShowcase(page, { theme: 'light', viewport: { width: 1440, height: 1100 } });
  await page.addStyleTag({ content: '.topbar { visibility: hidden !important; }' });

  const gallery = page.locator('#gallery');
  await gallery.scrollIntoViewIfNeeded();
  await expect(gallery).toHaveScreenshot('desktop-light-gallery.png');
});

test('configured builder and focus treatment remain stable', async ({ page }) => {
  await openShowcase(page, { viewport: { width: 1440, height: 1100 } });
  await page.getByLabel('Button label').fill('Ship safely');
  await page.getByLabel('Violet theme').click();
  await page.getByRole('button', { name: 'Gradient', exact: true }).click();
  await page.getByLabel('Button size').selectOption('bb-xl');
  await page.getByLabel('Button shape').selectOption('bb-rounded');
  await page.getByRole('button', { name: 'None', exact: true }).click();
  await page.getByLabel('Lifted shadow').check();

  const preview = page.locator('#builder-preview-button');
  await preview.focus();
  await expect(preview).toHaveText(/Ship safely/);
  await expect(preview).toHaveClass(/bb-violet/);
  await expect(preview).toHaveClass(/bb-gradient/);
  await expect(preview).toBeFocused();
  await expect(page.locator('#preview-canvas')).toHaveScreenshot('builder-focused-violet.png');
  await expect(page.locator('.output-card')).toHaveScreenshot('builder-output-violet.png');
});

test('right-to-left builder geometry remains stable', async ({ page }) => {
  await openShowcase(page, { viewport: { width: 1440, height: 1100 } });
  await page.getByLabel('Button label').fill('واجهة عربية');
  await page.getByLabel('Violet theme').click();
  await page.getByRole('button', { name: 'Gradient', exact: true }).click();
  await page.getByRole('button', { name: 'Right to left', exact: true }).click();
  await page.getByRole('button', { name: 'None', exact: true }).click();
  await page.addStyleTag({
    content: `
      .topbar { display: none !important; }
      .canvas-label { visibility: hidden !important; }
      #builder-preview-button { width: 220px !important; }
      #builder-preview-button .preview-label {
        background: #fff !important;
        border-radius: 999px !important;
        color: transparent !important;
        display: block !important;
        font-size: 0 !important;
        height: 8px !important;
        width: 82px !important;
      }
      #builder-preview-button .bb-btn-icon {
        background: #fff !important;
        border-radius: 50% !important;
        height: 14px !important;
        width: 14px !important;
      }
      #builder-preview-button .bb-btn-icon svg { display: none !important; }
    `
  });

  const preview = page.locator('#builder-preview-button');
  const labelBox = await preview.locator('.preview-label').boundingBox();
  const iconBox = await preview.locator('.bb-btn-icon').boundingBox();
  expect(iconBox.x).toBeLessThan(labelBox.x);
  await expect(preview).toBeVisible();
  await expect(preview).toHaveAttribute('dir', 'rtl');
  await expect(page.locator('#preview-canvas')).toHaveScreenshot('builder-rtl-geometry.png');
});

test('mobile menu and hero remain stable', async ({ page }) => {
  await openShowcase(page, { viewport: mobile });
  const menu = page.locator('#menu-toggle');
  await menu.click();
  await expect(menu).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('#primary-nav')).toBeVisible();
  await page.evaluate(() => window.scrollTo(0, 0));

  await expect(page).toHaveScreenshot('mobile-menu-dark.png');
});

test('forced-colors focus surface remains stable', async ({ page }) => {
  await openShowcase(page, { forcedColors: 'active' });
  const preview = page.locator('#builder-preview-button');
  await preview.focus();
  await expect(preview).toBeFocused();

  await expect(page.locator('#preview-canvas')).toHaveScreenshot('forced-colors-focus.png');
});
