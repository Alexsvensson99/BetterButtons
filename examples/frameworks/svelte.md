# Svelte example

Import BetterButtons once from your application entry point or root layout:

```js
import 'betterbuttons';
```

Compose the classes on a native button:

```svelte
<script>
  export let pending = false;
  export let onSave;
</script>

<button
  type="button"
  class:bb-loading={pending}
  class:bb-anim-shine={!pending}
  class="bb-btn bb-ocean bb-solid bb-lg bb-pill"
  disabled={pending}
  aria-busy={pending || undefined}
  on:click={onSave}
>
  Save changes
</button>
```

Announce the completed or failed result in an application status region when it is not otherwise obvious.
