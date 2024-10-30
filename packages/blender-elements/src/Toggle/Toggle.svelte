<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import type { Icon } from "../icons";

  export let icon: Icon | undefined = undefined;
  export let label = "";
  export let value: boolean | undefined = undefined;
  export let transparent = false;
  export let hint: string | undefined = undefined;
  export let location: "ALONE" | "LEFT" | "CENTER" | "RIGHT" = "ALONE";

  const dispatch = createEventDispatcher();

  function onToggle() {
    if (typeof value === "boolean") {
      value = !value;
      dispatch("change", value);
    }
  }
</script>

<button
  class="toggle"
  class:pressed={value}
  class:transparent
  class:with-label={label}
  data-location={location}
  title={hint}
  on:click={onToggle}
  on:click|stopPropagation
  on:dblclick|stopPropagation={() => {}}
>
  {#if icon}
    <span class="icon" style="background-image: var(--icon-{icon})" />
  {/if}
  {#if label}
    <span class="label">
      {label}
    </span>
  {/if}
</button>

<style>
  .toggle {
    appearance: none;
    background: transparent no-repeat center center;
    border: none;
    box-sizing: border-box;
    display: inline-flex;
    align-items: center;
    gap: 2px;
    box-sizing: border-box;
    min-height: 18px;
    min-width: 18px;
    flex-shrink: 0;
    opacity: 0.8;
    color: white;
    padding: 1px;
    cursor: pointer;

    &.with-label {
      padding-inline: 4px;
    }
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
      box-shadow: 0 1px 1px rgba(black, 0.6);
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

  .icon {
    display: inline-block;
    width: 16px;
    height: 16px;
    background: transparent no-repeat center center;
    background-size: contain;
    flex-shrink: 0;
  }

  .label {
    flex: 1;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    text-shadow: 0 1px 1px rgba(black, 0.4);
  }
</style>
