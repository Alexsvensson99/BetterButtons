# Browser support

BetterButtons targets currently supported evergreen Chromium, Firefox and WebKit-based browsers. Continuous integration runs the behavior and accessibility suite in Chromium, Firefox and WebKit; local development defaults to installed Chrome.

The public stylesheet uses modern CSS including cascade layers, custom properties, `color-mix()`, `aspect-ratio`, `:focus-visible` and `backdrop-filter`. Browsers without those capabilities are outside the support baseline. There is no Internet Explorer build.

## Progressive behavior

- Core layout, color, focus and disabled states should remain usable even if a decorative filter is unavailable.
- `bb-glass` depends on backdrop filtering for its intended appearance and should be tested on the product's real surface.
- Motion is removed when `prefers-reduced-motion: reduce` is active.
- Forced-colors mode uses system colors and a visible system focus outline.

The showcase is a documentation application and can use newer presentation features than the packaged CSS. If a browser-specific defect is reported, include its exact version, operating system, markup and the smallest affected class combination.
