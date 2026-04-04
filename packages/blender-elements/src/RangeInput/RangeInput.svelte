<script lang="ts" module>
  /**
   * Inspired by Blender's Number field
   * https://docs.blender.org/manual/en/latest/interface/controls/buttons/fields.html
   */
  import Mexp from "math-expression-evaluator";
  import blurOnEnter from "../actions/blurOnEnter";
  import numberDrag from "../actions/numberDrag";
  import revertOnEscape from "../actions/revertOnEscape";

  const mexp = new Mexp();
</script>

<script lang="ts">
  type Props = {
    from: number;
    till: number;
    value: number | undefined;
    setValue?: (value: number) => void;
    label?: string;
    rounded?: "all" | "top" | "bottom" | "none";
    id?: string;
  };
  let {
    from,
    till,
    value = $bindable(),
    label = "",
    rounded = "all",
    id,
    setValue,
  }: Props = $props();

  let el: HTMLInputElement;
  /** Shadow value to detect prop changes */
  let wanted = $state(value);
  let text = $state(format(value));
  let focused = $state(false);
  let active = $state(false);
  let previous = $state(value);

  let clientWidth = $state(1);
  let range = $derived(till - from);
  let normalized = $derived.by(() => {
    if (value === undefined || value <= from) {
      return 0;
    } else if (value >= till) {
      return 1;
    }
    return (value - from) / range;
  });
  let percentage = $derived(`${(normalized * 100).toPrecision(2)}%`);

  let step = $derived.by(() => {
    const perPixel = range / clientWidth;
    const multiplier = Math.pow(10, 1 - Math.floor(Math.log10(perPixel)) - 1);
    return Math.round(perPixel * multiplier) / multiplier;
  });

  $effect(() => {
    if (wanted !== value && document.activeElement !== el) {
      text = format(value);
      wanted = value;
    }
  });

  function format(val: number | undefined) {
    if (val === undefined || Number.isNaN(val)) {
      return "";
    }
    if (val > 1000000) {
      return Math.round(val).toString();
    }
    return val.toFixed(3).toString().substring(0, 7);
  }

  function onInput() {
    try {
      wanted = mexp.eval(el.value);
    } catch {
      return;
    }
    if (value !== wanted) {
      value = wanted;
    }
  }

  function onFocus() {
    previous = value;
    focused = true;
    if (value === undefined) {
      el.value = "";
    } else {
      el.value = `${value}`;
    }
    el.select();
  }

  function onBlur() {
    focused = false;
    text = format(value);
    if (wanted !== previous) {
      value = wanted;
      if (typeof value === "number") {
        setValue?.(value);
      }
      text = format(value);
    }
  }

  function onChange(next: number) {
    value = next;
    setValue?.(value);
  }

  function onClick(e: MouseEvent) {
    const type = (e.target as HTMLElement).nodeName;
    if (type !== "BUTTON") {
      el.focus();
    }
  }

  function onDown() {
    active = true;
  }

  function onUp() {
    active = false;
  }
</script>

<div
  class="range-input"
  class:active
  class:focused
  class:with-label={label}
  style:--percentage={percentage}
  data-rounded={rounded}
  bind:clientWidth
>
  {#if label}
    <label class="label" for={id}>{label}</label>
  {/if}
  <input
    class="input"
    {id}
    use:blurOnEnter
    use:revertOnEscape={previous?.toString() ?? ""}
    bind:this={el}
    bind:value={text}
    oninput={onInput}
    onfocus={onFocus}
    onblur={onBlur}
  />

  {#if !focused}
    <div
      class="drag"
      use:numberDrag={{
        value,
        step,
        min: from,
        max: till,
        onChange,
        onClick,
        onDown,
        onUp,
      }}
    ></div>
  {/if}
</div>

<style>
  .range-input {
    --background: #545454;

    user-select: none;
    position: relative;
    overflow: hidden;
    background: linear-gradient(
      to right,
      #4772b3 0%,
      #4772b3 var(--percentage),
      var(--background) var(--percentage),
      var(--background) 100%
    );

    &:not(.focused, .active):hover {
      --background: #656565;
    }

    &.active {
      --background: #222;
    }

    &.focused {
      background: #222;
    }

    &[data-rounded="all"] {
      border-radius: 2px / 3px;
    }

    &[data-rounded="top"] {
      border-top-left-radius: 2px 3px;
      border-top-right-radius: 2px 3px;
    }

    &[data-rounded="bottom"] {
      border-bottom-right-radius: 2px 3px;
      border-bottom-left-radius: 2px 3px;
    }
  }

  .label {
    position: absolute;
    top: 2px;
    left: 8px;

    .range-input:focus-within & {
      display: none;
    }
  }

  .input {
    display: block;

    box-sizing: border-box;
    width: 100%;
    padding-block: 2px;
    padding-inline: 8px;
    border: 0;

    font: inherit;
    color: #e5e5e5;
    text-align: center;
    text-shadow: 0 1px 2px #000c;

    background-color: transparent;
    outline: none;

    &::selection {
      background-color: #4570b5;
    }

    .with-label & {
      padding-right: 8px;
      text-align: right;
    }

    &:focus {
      color: #e5e5e5;
      text-align: left;
    }
  }

  :not(.focused, .active) .input:hover {
    color: #fcfcfc;
    background-color: #797979;
  }

  .drag {
    cursor: col-resize;
    position: absolute;
    inset: 0;
  }
</style>
