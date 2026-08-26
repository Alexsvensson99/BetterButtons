# Customization

BetterButtons exposes CSS custom properties so a product can add a theme without forking the library.

## Add a brand theme

Define the complete token contract in application CSS loaded after BetterButtons:

```css
.bb-brand {
  --bb-primary: #6d5dfc;
  --bb-primary-hover: #8174ff;
  --bb-primary-active: #5547d8;
  --bb-primary-text: #ffffff;
  --bb-primary-light: #f0eeff;
  --bb-primary-dark: #3e329c;
  --bb-primary-rgb: 109, 93, 252;
  --bb-primary-gradient: linear-gradient(135deg, #8c7fff, #5040d4);
}
```

```html
<button type="button" class="bb-btn bb-brand bb-solid bb-lg bb-pill">Continue</button>
```

`--bb-primary-rgb` is a comma-separated RGB triplet because shadows and translucent surfaces use it inside `rgba()`.

## Scope defaults

Tokens inherit, so defaults can be set for a product area:

```css
.account-area {
  --bb-transition: 120ms ease-out;
  --bb-radius-md: 10px;
  --bb-text-md: 1rem;
}
```

Avoid globally changing color tokens if the same page uses multiple BetterButtons themes.

## Override a component deliberately

The source uses cascade layers. Application CSS that is not in a layer and loads after the library can override layered declarations without high specificity:

```css
.checkout-action {
  min-height: 3rem;
  padding-inline: 1.5rem;
}
```

Prefer a product-specific class over targeting generated class combinations. Do not depend on internal keyframe names or stylesheet declaration order.

## Keep customizations accessible

After changing tokens, test text contrast, focus visibility, hover, disabled, reduced-motion and forced-colors states. Transparent styles such as `bb-outline`, `bb-ghost` and `bb-glass` must be checked on every background where they appear.
