<script lang="ts">
  /**
   * Inspired by Blender's Number field
   * https://docs.blender.org/manual/en/latest/interface/controls/buttons/fields.html
   */
  import blurOnEnter from "../actions/blurOnEnter";
  import numberDrag from "../actions/numberDrag";
  import revertOnEscape from "../actions/revertOnEscape";

  type Props = {
    value: number | undefined;
    setValue?: (value: number) => void;
    suffix?: string;
    location?: "alone" | "top" | "middle" | "bottom";
    id?: string;
    step?: number;
    min?: number;
    max?: number;
  };
  let {
    value = $bindable(),
    suffix = "",
    location = "alone",
    id,
    step,
    min,
    max,
    setValue,
  }: Props = $props();

  let el: HTMLInputElement;
  /** Shadow value to detect prop changes */
  let wanted = $state(value);
  let text = $state(format(value));
  let focused = $state(false);
  let active = $state(false);
  let previous = $state(value);

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
      return Math.round(val).toString() + suffix;
    }
    return (
      val
        .toFixed(6)
        .toString()
        .substring(0, 7)
        .replace(/\.?0+$/, "") + suffix
    );
  }

  function onInput() {
    if (Number.isNaN(Number(el.value))) {
      return;
    }
    wanted = Number(el.value);
    if (value !== wanted) {
      value = wanted;
    }
  }
  function onFocus() {
    previous = value;
    focused = true;
    if (suffix && text.endsWith(suffix)) {
      text = text.substring(0, text.length - suffix.length);
      el.value = text;
    }
    el.select();
  }
  function onBlur() {
    focused = false;
    text = format(value);
    if (wanted !== previous) {
      value = wanted;
      text = format(value);
      if (typeof value === "number") {
        setValue?.(value);
      }
    }
  }

  function onStepDown() {
    if (step && typeof value === "number") {
      value -= step;
      setValue?.(value);
    }
  }
  function onStepUp() {
    if (step && typeof value === "number") {
      value += step;
      setValue?.(value);
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

<div class="number-field" class:active class:focused data-location={location}>
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
  {#if !focused && step}
    <div
      class="drag"
      use:numberDrag={{
        value,
        step,
        min,
        max,
        onChange,
        onClick,
        onDown,
        onUp,
      }}
    >
      <button class="arrow left" onclick={onStepDown} aria-label="down"
      ></button>
      <button class="arrow right" onclick={onStepUp} aria-label="up"></button>
    </div>
  {/if}
</div>

<style>
  .number-field {
    position: relative;
    overflow: hidden;
    background: #545454;

    &:not(.focused, .active):hover {
      background-color: #656565;
    }

    &.active,
    &.focused {
      background-color: #222;
    }

    &[data-location="alone"] {
      border-radius: 2px / 3px;
    }

    &[data-location="top"] {
      margin-bottom: 1px;
      border-top-left-radius: 2px 3px;
      border-top-right-radius: 2px 3px;
    }

    &[data-location="middle"] {
      margin-bottom: 1px;
    }

    &[data-location="bottom"] {
      border-bottom-right-radius: 2px 3px;
      border-bottom-left-radius: 2px 3px;
    }
  }

  .input {
    display: block;

    box-sizing: border-box;
    width: 100%;
    padding-top: 2px;
    padding-bottom: 2px;
    border: 0;

    font:
      12px system-ui,
      sans-serif;
    color: #e5e5e5;
    text-align: center;
    text-shadow: 0 1px 2px #000c;

    background-color: transparent;
    outline: none;

    &::selection {
      background-color: #4570b5;
    }

    &:focus {
      color: #e5e5e5;
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

  .arrow {
    cursor: pointer;

    position: absolute;
    top: 0;
    bottom: 0;

    display: none;

    width: 13px;
    border: none;

    color: white;

    background: none;
    background: #656565 no-repeat center center;

    &.left {
      left: 0;
      background-image: var(--icon-chevron-left);
    }

    &.right {
      right: 0;
      background-image: var(--icon-chevron-right);
    }
  }

  .number-field:hover .arrow {
    display: block;
  }

  /* stylelint-disable-next-line no-descending-specificity */
  .active .arrow {
    background-color: #222;
  }

  :not(.focused, .active) .arrow:hover {
    background-color: #797979;
  }
</style>
