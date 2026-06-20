<script lang="ts">
  import type { Icon } from "../icons";

  type Props = {
    icon?: Icon | undefined;
    width?: number | undefined;
    height?: number | undefined;
    minWidth?: number | undefined;
    label?: string;
    value?: boolean | undefined;
    transparent?: boolean;
    hint?: string | undefined;
    rounded?: "all" | "left" | "right" | "none";
    muted?: boolean;
    setValue?: (value: boolean) => void;
    onclick?: () => void;
  };

  let {
    icon,
    width = 16,
    height = 16,
    minWidth,
    label = "",
    value = $bindable(undefined),
    transparent = false,
    hint,
    rounded = "all",
    muted = false,
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
  class:muted
  class:with-label={label}
  data-rounded={rounded}
  style:min-width={minWidth ? `${minWidth}px` : undefined}
  title={hint}
  onclick={(e) => {
    e.stopPropagation();
    toggle();
    onclick?.();
  }}
  ondblclick={(e) => e.stopPropagation()}
>
  {#if icon}
    <span
      class="icon"
      style:width="{width}px"
      style:height="{height}px"
      style:background-image="var(--icon-{icon})"
      style:margin-inline={minWidth ? "auto" : undefined}
    ></span>
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
    user-select: none;

    display: inline-flex;
    flex-shrink: 0;
    gap: 2px;
    align-items: center;

    box-sizing: border-box;
    min-height: 20px;
    padding: 1px;
    border: 1px solid transparent;

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
      border-left: 0;
      border-top-right-radius: 2px 3px;
      border-bottom-right-radius: 2px 3px;
    }

    &[data-rounded="none"] {
      border-left: 0;
    }

    &:not(:global(.transparent)) {
      border-color: #3d3d3d;
      background-color: #656565;
      box-shadow: 0 0.5px 0 #323232bf;
    }

    &:hover {
      opacity: 1;
    }

    &.pressed,
    &:active {
      opacity: 1;
      background-color: #4772b3;
    }

    &.muted {
      opacity: 0.3;
    }
  }

  .icon {
    display: inline-block;
    flex-shrink: 0;
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
