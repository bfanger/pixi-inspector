<script lang="ts">
  type Props = {
    value?: boolean | undefined;
    setValue?: (value: boolean) => void;
    location?: "alone" | "left" | "center" | "right";
    label?: string;
    children?: import("svelte").Snippet;
    onclick?: () => void;
  };

  let {
    value = $bindable(undefined),
    setValue,
    label = "",
    location = "alone",
    children,
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
  class="button"
  class:pressed={value}
  data-location={location}
  onclick={(e) => {
    e.stopPropagation();
    toggle();
    onclick?.();
  }}
  ondblclick={(e) => e.stopPropagation()}
>
  {#if label}
    {label}
  {:else if children}
    <span>{@render children?.()}</span>
  {/if}
</button>

<style>
  .button {
    cursor: pointer;
    user-select: none;

    display: block;
    flex-shrink: 0;

    box-sizing: border-box;
    width: 100%;
    height: 18px;
    padding-inline: 8px;
    border: 1px solid #3d3d3d;

    font: inherit;
    color: #e6e6e6;

    appearance: none;
    background: #545454 no-repeat center center;
    box-shadow: 0 1px 1px #0009;

    &[data-location="alone"] {
      border-radius: 2px / 3px;
    }

    &[data-location="left"] {
      margin-right: 1px;
      border-top-left-radius: 2px 3px;
      border-bottom-left-radius: 2px 3px;
    }

    &[data-location="center"] {
      margin-right: 1px;
    }

    &[data-location="right"] {
      border-top-right-radius: 2px 3px;
      border-bottom-right-radius: 2px 3px;
    }

    &:hover {
      color: #fff;
      background: #656565;
    }

    &.pressed,
    &:active {
      color: #fff;
      background-color: #4772b3;
    }
  }
</style>
