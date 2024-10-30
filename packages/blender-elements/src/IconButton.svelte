<script lang="ts">
  import type { Icon } from "./icons";

  export let icon: Icon;
  export let muted = false;
  export let hint: string | undefined = undefined;
</script>

<button
  class="toggle"
  class:muted
  style="background-image: var(--icon-{icon})"
  title={hint}
  on:click|stopPropagation
  on:dblclick|stopPropagation={() => {}}
/>

<style>
  .toggle {
    appearance: none;
    background: transparent no-repeat center center;
    border: none;
    width: 20px;
    height: 20px;
    opacity: 0.6;
    flex-shrink: 0;
    cursor: pointer;

    &:active,
    &:hover {
      opacity: 0.8;
    }
    &.muted {
      opacity: 0.3;
    }
  }
</style>
