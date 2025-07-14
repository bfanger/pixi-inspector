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
  ondblclick={(e) => e.stopPropagation()}>{@render children?.()}{label}</button
>

<style>
  .button {
    appearance: none;
    background: #545454 no-repeat center center;
    color: #e6e6e6;
    border: 1px solid #3d3d3d;
    padding-inline: 8px;
    height: 18px;
    flex-shrink: 0;
    box-shadow: 0 1px 1px #00000099;
    cursor: pointer;

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

    &:hover {
      background: #656565;
      color: #ffffff;
    }
    &.pressed,
    &:active {
      background-color: #4772b3;
      color: #ffffff;
    }
  }
</style>
