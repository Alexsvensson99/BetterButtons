# Framework integrations

BetterButtons stays framework-independent: each integration imports the same CSS package and renders semantic HTML. There is no adapter package, component runtime or client-side initialization.

## Install once

```bash
npm install betterbuttons
```

Import the stylesheet from an application entry point, layout or component that your bundler includes once:

```js
import 'betterbuttons';
```

Then compose the documented classes directly on native buttons and links. Keep application behavior, state and accessible naming in the framework layer.

## Copyable examples

- [React action button](../examples/frameworks/react.md)
- [Vue action button](../examples/frameworks/vue.md)
- [Svelte action button](../examples/frameworks/svelte.md)

Each example keeps the visible label in the DOM while loading, uses the native `disabled` attribute and exposes `aria-busy`. Adapt the event name and state management to the application rather than adding BetterButtons-specific JavaScript.

The visual builder serializes a custom label as a JavaScript string and binds it through a fixed local `label` variable in React, Vue and Svelte output. Braces, mustaches, markup-looking text and script-closing text therefore remain label data when the generated component is compiled.

## Navigation components

For client-side navigation, apply BetterButtons classes to the framework's link component when it renders a real anchor with an `href`. Use a native button for an action on the current page.

```jsx
<Link className="bb-btn bb-ocean bb-outline bb-md bb-rounded" to="/settings">
  Open settings
</Link>
```

Confirm that the rendered result is an `<a href="…">`; do not add `role="button"` to a generic element.

## Server rendering

The package has no runtime JavaScript and does not read browser globals, so its CSS can be included by server-rendered and statically generated applications. The consuming framework and bundler still determine where global CSS imports are allowed.

## Direction and localization

BetterButtons inherits `dir` from the document or nearest ancestor. Groups, split actions, badges and directional motion follow the inline direction automatically. Prefer setting `dir="rtl"` on the localized page or region instead of on every control.

See the standalone [RTL example](../examples/rtl.html) and the [CSS API direction contract](API.md#writing-direction).
