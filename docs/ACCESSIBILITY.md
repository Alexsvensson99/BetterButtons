# Accessibility guide

BetterButtons supplies visual states; the consuming application supplies meaning, labels and action behavior. Both are required for an accessible result.

## Choose the correct element

- Use `<button type="button">` for an action on the current page.
- Use `<button type="submit">` only when it should submit its form.
- Use `<a href="…">` for navigation.
- Do not turn a `<div>` or `<span>` into a button.

## Accessible names

Visible text is normally the best accessible name. Decorative icons inside a labeled button should use `aria-hidden="true"`. Icon-only circle buttons require a concise `aria-label` describing the action, not the icon.

```html
<button type="button" class="bb-btn bb-ocean bb-solid bb-md bb-circle bb-icon-only" aria-label="Next page">
  <span class="bb-btn-icon" aria-hidden="true">→</span>
</button>
```

## Disabled and loading states

Prefer the native `disabled` attribute when the action cannot be used. `aria-disabled="true"` exposes state but does not prevent activation, so application code must block the action if that pattern is necessary.

For an indeterminate loading button:

```html
<button type="button" class="bb-btn bb-ocean bb-solid bb-lg bb-loading" disabled aria-busy="true">
  Saving changes
</button>
```

Keep the original label in the DOM so the accessible name remains useful. Announce completion or failure in a separate status region when the result is not otherwise obvious.

## Keyboard and focus

The base class has a visible `:focus-visible` ring. Do not remove it without providing an equally visible replacement. Native buttons activate with Enter and Space; native links activate with Enter.

For `bb-group` or `bb-split`, give the container a group label and preserve a logical DOM and tab order.

## Language and direction

Set the correct `lang` and `dir` on the document or the nearest localized region. BetterButtons mirrors grouped corners, split separators, badges and directional motion in right-to-left contexts without reversing DOM order. Keyboard and screen-reader order should continue to follow the meaningful source order.

Do not use CSS `direction` or visual reordering as a substitute for semantic document direction. Test mixed-direction labels and icons with real translated content.

## Color and surfaces

The included theme-and-style combinations are designed with contrast in mind, but transparent styles inherit the surrounding surface and custom tokens can invalidate contrast. Check normal text, hover, focus, disabled and forced-colors states in the actual product context.

Color must not be the only way to communicate state. Pair destructive, successful or selected states with text, an icon, structure or an accessible state attribute.

## Motion

The library disables animations and transitions when the operating system requests reduced motion. Avoid adding application animations that override this behavior. `bb-anim-none` is available when a control should never animate.

## Verification

The repository runs automated axe checks and keyboard-focused browser tests. Before shipping a product integration, also test:

- keyboard-only operation;
- browser zoom at 200% and 400%;
- a screen reader on at least one target platform;
- forced-colors or high-contrast mode;
- both left-to-right and right-to-left content when the product is localized;
- reduced-motion mode;
- every custom theme on its real background.

Automated testing detects only a subset of accessibility problems and is not a certification of WCAG conformance.
