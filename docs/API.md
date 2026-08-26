# CSS API

BetterButtons is a composable class API. Apply `bb-btn`, then select a theme and style. Size, shape, motion and utility classes refine the result.

## Base

| Class          | Purpose                                                       |
| -------------- | ------------------------------------------------------------- |
| `bb-btn`       | Required base layout, typography, focus and disabled behavior |
| `bb-btn-icon`  | Aligns a text character or SVG icon inside a button           |
| `bb-icon-only` | Normalizes padding for icon-only controls                     |

Use a semantic `<button>` for actions and an `<a href="…">` for navigation. Do not add button roles to generic elements.

## Themes

Each theme sets the complete color-token contract.

|              |               |              |                 |
| ------------ | ------------- | ------------ | --------------- |
| `bb-crimson` | `bb-ocean`    | `bb-emerald` | `bb-sunset`     |
| `bb-violet`  | `bb-midnight` | `bb-coral`   | `bb-teal`       |
| `bb-gold`    | `bb-slate`    | `bb-rose`    | `bb-indigo`     |
| `bb-amber`   | `bb-lime`     | `bb-fuchsia` | `bb-cyan`       |
| `bb-bronze`  | `bb-lavender` | `bb-neon`    | `bb-monochrome` |

## Styles

| Class           | Character                              |
| --------------- | -------------------------------------- |
| `bb-solid`      | Filled primary surface                 |
| `bb-outline`    | Transparent surface with themed border |
| `bb-ghost`      | Borderless, low-emphasis action        |
| `bb-glass`      | Translucent backdrop-filtered surface  |
| `bb-gradient`   | Theme-defined gradient                 |
| `bb-soft`       | Light themed surface                   |
| `bb-neon-style` | High-energy outline and glow           |
| `bb-neumorphic` | Fixed light neutral raised surface     |
| `bb-flat`       | Square, flat color block               |
| `bb-raised`     | Tactile offset surface                 |
| `bb-pill-style` | Glossy pill treatment                  |
| `bb-brutalist`  | Hard border and offset shadow          |

Some style classes provide their own border radius. The documented cascade-layer contract is stable: `bb-shapes` has higher priority than `bb-styles`, so an explicit shape class wins. For example, `bb-flat bb-pill` is pill-shaped and `bb-pill-style bb-square` is square. Without a shape class, the style's own geometry remains in effect. Changing this priority is a breaking API change.

## Sizes

`bb-xs`, `bb-sm`, `bb-md`, `bb-lg`, `bb-xl` and `bb-2xl` adjust font size, padding and minimum height.

## Shapes

| Class        | Purpose                                         |
| ------------ | ----------------------------------------------- |
| `bb-rounded` | Medium rounded corners                          |
| `bb-square`  | No corner radius                                |
| `bb-pill`    | Fully rounded ends                              |
| `bb-circle`  | Equal width and height for an icon-only control |

Circle buttons need `bb-icon-only` and an accessible name:

```html
<button
  type="button"
  class="bb-btn bb-ocean bb-solid bb-lg bb-circle bb-icon-only"
  aria-label="Open settings"
>
  <span class="bb-btn-icon" aria-hidden="true">⚙</span>
</button>
```

## Motion

|                  |                                              |
| ---------------- | -------------------------------------------- |
| `bb-anim-shine`  | Sweep highlight on hover                     |
| `bb-anim-pulse`  | Repeating hover pulse                        |
| `bb-anim-ripple` | Press ripple                                 |
| `bb-anim-bounce` | Hover bounce                                 |
| `bb-anim-shake`  | Hover shake                                  |
| `bb-anim-glow`   | Repeating themed glow                        |
| `bb-anim-slide`  | Sliding overlay                              |
| `bb-anim-fill`   | Rising overlay                               |
| `bb-anim-pop`    | Single hover pop                             |
| `bb-anim-none`   | Explicitly disables animation and transition |

All motion is disabled when `prefers-reduced-motion: reduce` is active. The showcase also uses `html[data-reduced-motion="true"]` for its manual preview control.

## Utilities and states

| Class        | Purpose                                                                     |
| ------------ | --------------------------------------------------------------------------- |
| `bb-shadow`  | Adds a themed lifted shadow                                                 |
| `bb-block`   | Makes a non-circle button fill its container                                |
| `bb-loading` | Shows an indeterminate spinner; pair with `disabled` and `aria-busy="true"` |
| `bb-badge`   | Positions a small badge within a button                                     |
| `bb-group`   | Joins adjacent child buttons                                                |
| `bb-split`   | Joins the primary and secondary parts of a split action                     |

For grouped controls, add an accessible group name in application markup, for example `<div class="bb-group" role="group" aria-label="Text alignment">`.

## Public tokens

Themes define these custom properties: `--bb-primary`, `--bb-primary-hover`, `--bb-primary-active`, `--bb-primary-text`, `--bb-primary-light`, `--bb-primary-dark`, `--bb-primary-rgb` and `--bb-primary-gradient`.

Global sizing tokens include `--bb-transition`, `--bb-radius-sm`, `--bb-radius-md`, `--bb-radius-lg`, `--bb-radius-xl`, `--bb-radius-full`, and `--bb-text-xs` through `--bb-text-2xl`.

Treat documented classes, tokens and the style-versus-shape layer priority as the public API. Internal keyframe names and declaration order within a documented layer may change in minor releases.
