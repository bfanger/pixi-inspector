<script lang="ts">
  import type { Icon } from "./icons";

  export let icon: Icon;
</script>

<button class="toggle" style="background-image: var(--icon-{icon})" on:click />

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
