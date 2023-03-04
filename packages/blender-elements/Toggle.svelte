<script lang="ts">
  import type { Icon } from "./icons";

  export let icon: Icon;
  export let hint: string | undefined = undefined;
</script>

<button
  class="toggle"
  style="background-image: var(--icon-{icon})"
  title={hint}
  on:click|stopPropagation
/>

<style lang="scss">
  .toggle {
    appearance: none;
    background: transparent no-repeat center center;
    border: none;
    width: 20px;
    height: 20px;
    opacity: 0.6;
    flex-shrink: 0;
    &:active,
    &:hover {
      opacity: 0.8;
    }
  }
</style>
