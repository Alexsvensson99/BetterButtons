# Browser support

BetterButtons targets currently supported evergreen Chromium, Firefox and WebKit-based browsers. Continuous integration runs the behavior and accessibility suite in Chromium, Firefox and WebKit; local development defaults to installed Chrome.

The public stylesheet uses modern CSS including cascade layers, custom properties, logical properties, `color-mix()`, `aspect-ratio`, `:dir()`, `:focus-visible` and `backdrop-filter`. Browsers without those capabilities are outside the support baseline. There is no Internet Explorer build.

## Progressive behavior

- Core layout, color, focus and disabled states should remain usable even if a decorative filter is unavailable.
- `bb-glass` depends on backdrop filtering for its intended appearance and should be tested on the product's real surface.
- Motion is removed when `prefers-reduced-motion: reduce` is active.
- `prefers-contrast: more` strengthens borders and focus treatment where the browser exposes that preference.
- Forced-colors mode uses system colors for controls, badges and loading indicators plus a visible system focus outline.
- Logical group, split, badge and loading geometry follows inherited left-to-right or right-to-left direction.

The showcase is a documentation application and can use newer presentation features than the packaged CSS. If a browser-specific defect is reported, include its exact version, operating system, markup and the smallest affected class combination.
