<script lang="ts">
  import type { Icon } from "./icons";

  export let icon: Icon;
  export let value: boolean | undefined = undefined;
  export let transparent = false;
  export let hint: string | undefined = undefined;
  export let location: "ALONE" | "LEFT" | "CENTER" | "RIGHT" = "ALONE";

  function onToggle() {
    if (typeof value === "boolean") {
      value = !value;
    }
  }
</script>

<button
  class="toggle"
  class:pressed={value}
  class:transparent
  data-location={location}
  style="background-image: var(--icon-{icon})"
  title={hint}
  on:click={onToggle}
  on:click|stopPropagation
  on:dblclick|stopPropagation
/>

<style lang="scss">
  .toggle {
    appearance: none;
    background: transparent no-repeat center center;
    border: none;
    width: 20px;
    height: 20px;
    flex-shrink: 0;
    cursor: pointer;
    opacity: 0.8;

    &[data-location="ALONE"] {
      border-radius: 2px / 3px;
    }
    &[data-location="LEFT"] {
      border-top-left-radius: 2px 3px;
      border-bottom-left-radius: 2px 3px;
      margin-right: 1px;
    }
    &[data-location="CENTER"] {
      margin-right: 1px;
    }
    &[data-location="RIGHT"] {
      border-top-right-radius: 2px 3px;
      border-bottom-right-radius: 2px 3px;
    }

    &:not(.transparent) {
      background-color: #656565;
    }

    &:hover {
      opacity: 1;
    }
    &.pressed,
    &:active {
      background-color: #4772b3;
      opacity: 1;
    }
  }
</style>
