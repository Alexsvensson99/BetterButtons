# React example

Import BetterButtons once from your application entry point or root layout:

```jsx
import 'betterbuttons';
```

This component keeps the action label available to assistive technology while the visual loading indicator is active:

```jsx
export function SaveButton({ pending = false, onSave }) {
  const classes = [
    'bb-btn',
    'bb-ocean',
    'bb-solid',
    'bb-lg',
    'bb-pill',
    pending ? 'bb-loading' : 'bb-anim-shine'
  ].join(' ');

  return (
    <button
      type="button"
      className={classes}
      disabled={pending}
      aria-busy={pending || undefined}
      onClick={onSave}
    >
      Save changes
    </button>
  );
}
```

Announce the completed or failed result in an application status region when it is not otherwise obvious.
