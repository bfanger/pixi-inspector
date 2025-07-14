<script lang="ts">
  import type { Icon } from "../icons";

  type Props = {
    icon?: Icon | undefined;
    label?: string;
    value?: boolean | undefined;
    transparent?: boolean;
    hint?: string | undefined;
    location?: "alone" | "left" | "center" | "right";
    setValue?: (value: boolean) => void;
    onclick?: () => void;
  };

  let {
    icon = undefined,
    label = "",
    value = $bindable(undefined),
    transparent = false,
    hint = undefined,
    location = "alone",
    setValue,
    onclick,
  }: Props = $props();

  function toggle() {
    if (typeof value === "boolean") {
      value = !value;
      setValue?.(value);
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
  onclick={(e) => {
    e.stopPropagation();
    toggle();
    onclick?.();
  }}
  ondblclick={(e) => e.stopPropagation()}
>
  {#if icon}
    <span class="icon" style="background-image: var(--icon-{icon})"></span>
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
    &[data-location="alone"] {
      border-radius: 2px / 3px;
    }
    &[data-location="left"] {
      border-top-left-radius: 2px 3px;
      border-bottom-left-radius: 2px 3px;
      margin-right: 1px;
    }
    &[data-location="center"] {
      margin-right: 1px;
    }
    &[data-location="right"] {
      border-top-right-radius: 2px 3px;
      border-bottom-right-radius: 2px 3px;
    }

    &:not(:global(.transparent)) {
      background-color: #656565;
      box-shadow: 0 1px 1px #00000099;
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
    text-shadow: 0 1px 1px #00000066;
  }
</style>
