<script lang="ts">
  import type { Icon } from "../icons";

  type Props = {
    icon?: Icon | undefined;
    label?: string;
    value?: boolean | undefined;
    transparent?: boolean;
    hint?: string | undefined;
    rounded?: "all" | "left" | "right" | "none";
    setValue?: (value: boolean) => void;
    onclick?: () => void;
  };

  let {
    icon = undefined,
    label = "",
    value = $bindable(undefined),
    transparent = false,
    hint = undefined,
    rounded = "all",
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
  data-rounded={rounded}
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
    cursor: pointer;

    display: inline-flex;
    flex-shrink: 0;
    gap: 2px;
    align-items: center;

    box-sizing: border-box;
    min-width: 18px;
    min-height: 18px;
    padding: 1px;
    border: none;

    font: inherit;
    color: white;

    appearance: none;
    opacity: 0.8;
    background: transparent no-repeat center center;

    &.with-label {
      padding-inline: 4px;
    }

    &[data-rounded="all"] {
      border-radius: 2px / 3px;
    }

    &[data-rounded="left"] {
      border-top-left-radius: 2px 3px;
      border-bottom-left-radius: 2px 3px;
    }

    &[data-rounded="right"] {
      border-top-right-radius: 2px 3px;
      border-bottom-right-radius: 2px 3px;
    }

    &:not(:global(.transparent)) {
      background-color: #656565;
      box-shadow: 0 1px 1px #0009;
    }

    &:hover {
      opacity: 1;
    }

    &.pressed,
    &:active {
      opacity: 1;
      background-color: #4772b3;
    }
  }

  .icon {
    display: inline-block;
    flex-shrink: 0;

    width: 16px;
    height: 16px;

    background: transparent no-repeat center center;
    background-size: contain;
  }

  .label {
    overflow: hidden;
    flex: 1;

    text-overflow: ellipsis;
    text-shadow: 0 1px 1px #0006;
    white-space: nowrap;
  }
</style>
