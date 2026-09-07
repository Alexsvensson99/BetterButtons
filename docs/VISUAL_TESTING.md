# Visual regression testing

BetterButtons uses a dedicated Chromium screenshot suite to detect visual drift without weakening the existing Chromium, Firefox and WebKit behavior checks.

## Covered surfaces

The committed baselines cover six representative states:

- the dark desktop launch surface;
- the light desktop gallery and style cards;
- a configured builder preview with keyboard focus;
- the open mobile navigation and hero at 390 by 844 pixels;
- the focused preview surface in forced-colors mode.
- a dedicated right-to-left builder surface.

These snapshots protect layout, theme surfaces, representative button combinations, responsive navigation, focus treatment and RTL geometry. They complement rather than replace accessibility assertions and manual review.

## Run the suite

Install the pinned dependencies and Playwright Chromium once, then run the normal comparison:

```bash
npm ci
npx playwright install chromium
npm run test:visual
```

`npm run check` includes this comparison after the cross-browser behavior suite.

## Baseline layout

Snapshots are stored under `tests/visual/__screenshots__/<platform>/`. macOS and Linux have separate reviewed images because font rasterization and native controls can differ by operating system. CI and package verification use the Linux baselines on a pinned Ubuntu runner.

The visual config fixes Chromium, locale, timezone, viewport, device scale, reduced-motion preference and screenshot styling. Animations and carets are disabled during capture, scrollbars are hidden and the transient toast is excluded.

## Review and update baselines

Never accept snapshots only because a command produced them. For every intended visual change:

1. Run `npm run test:visual` and inspect the expected, actual and diff images in `test-results/visual/`.
2. Confirm the product change is intentional and does not hide clipping, overflow, contrast, focus or responsive regressions.
3. Run `npm run test:visual:update` on the platform whose baseline is changing.
4. Inspect every changed PNG at full size.
5. Run `npm run test:visual` twice without updating snapshots, followed by `npm run check`.
6. Commit only the reviewed platform images and explain the intended visual change in the pull request.

When a Linux baseline is missing, CI fails safely and uploads `tests/visual/__screenshots__/`, `test-results/` and the Playwright report in the `playwright-failure` artifact. Download and inspect those candidates before committing them; never make CI update repository baselines automatically.

Large design changes still require explicit owner approval before their new baselines are accepted.

## Manual release check

Before releasing the 2.1 candidate, manually check keyboard operation, 200% and 400% zoom, VoiceOver or another target screen reader, left-to-right and right-to-left content, and a real forced-colors or high-contrast environment when available. Record the environment and result separately; an emulated browser mode or a visual baseline does not complete this check.
