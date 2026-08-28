# Vue example

Import BetterButtons once from your application entry point or root layout:

```js
import 'betterbuttons';
```

Use native attributes and events in the component template:

```vue
<script setup>
defineProps({
  pending: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['save']);
</script>

<template>
  <button
    type="button"
    class="bb-btn bb-ocean bb-solid bb-lg bb-pill"
    :class="pending ? 'bb-loading' : 'bb-anim-shine'"
    :disabled="pending"
    :aria-busy="pending || undefined"
    @click="emit('save')"
  >
    Save changes
  </button>
</template>
```

Announce the completed or failed result in an application status region when it is not otherwise obvious.
