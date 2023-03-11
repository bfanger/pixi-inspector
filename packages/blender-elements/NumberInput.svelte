<svelte:options immutable />

<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import blurOnEnter from "./blurOnEnter";
  import numberDrag from "./numberDrag";
  import revertOnEscape from "./revertOnEscape";

  export let value: number | undefined;
  export let suffix = "";
  export let location: "ALONE" | "TOP" | "MIDDLE" | "BOTTOM" = "ALONE";
  export let id: string | undefined = undefined;
  export let step: number | undefined = undefined;
  export let min: number | undefined = undefined;
  export let max: number | undefined = undefined;

  const dispatch = createEventDispatcher();

  let el: HTMLInputElement;
  let wanted = value;
  let text = format(value);
  let focused = false;
  let active = false;

  $: if (wanted !== value && document.activeElement !== el) {
    text = format(value);
    wanted = value;
  }

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
      dispatch("change", value);
    }
  }
  function onFocus() {
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
  }

  function onStepDown() {
    if (step && typeof value === "number") {
      value -= step;
      dispatch("change", value);
    }
  }
  function onStepUp() {
    if (step && typeof value === "number") {
      value += step;
      dispatch("change", value);
    }
  }

  function onChange(next: number) {
    value = next;
    dispatch("change", value);
  }
  function onClick() {
    el.focus();
  }
  function onDown() {
    active = true;
  }
  function onUp() {
    active = false;
  }
</script>

<div
  class="number-input"
  class:active
  class:focused
  data-location={location}
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
  <input
    class="input"
    {id}
    use:blurOnEnter
    use:revertOnEscape={value?.toString() ?? ""}
    bind:this={el}
    bind:value={text}
    on:input={onInput}
    on:focus={onFocus}
    on:blur={onBlur}
  />
  {#if !focused && step}
    <div class="drag" />
    <button class="arrow left" on:click={onStepDown} />
    <button class="arrow right" on:click={onStepUp} />
  {/if}
</div>

<style lang="scss">
  .number-input {
    position: relative;
    background: #545454;
    overflow: hidden;

    &:not(.focused, .active):hover {
      background: #656565;
    }
    &.active,
    &.focused {
      background-color: #222222;
    }

    &[data-location="ALONE"] {
      border-radius: 2px / 3px;
    }
    &[data-location="TOP"] {
      border-top-left-radius: 2px 3px;
      border-top-right-radius: 2px 3px;
      margin-bottom: 0.5px;
    }
    &[data-location="MIDDLE"] {
      margin-bottom: 0.5px;
    }
    &[data-location="BOTTOM"] {
      border-bottom-left-radius: 2px 3px;
      border-bottom-right-radius: 2px 3px;
    }
  }
  .input {
    background-color: transparent;
    color: #e5e5e5;
    border: 0;
    text-align: center;
    outline: none;
    display: block;
    width: 100%;
    box-sizing: border-box;
    font: 12px system-ui, sans-serif;
    padding-top: 2px;
    padding-bottom: 2px;
    text-shadow: 0 1px 2px rgba(black, 0.8);

    :not(.focused, .active) &:hover {
      background-color: #797979;
      color: #fcfcfc;
    }
    &:focus {
      color: #e5e5e5;
    }
    &::selection {
      background-color: #4570b5;
    }
  }
  .drag {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    cursor: col-resize;
  }
  .arrow {
    position: absolute;
    background: none;
    border: none;
    color: white;
    top: 0;
    bottom: 0;
    width: 13px;
    background: #656565 no-repeat center center;
    display: none;
    cursor: Mouse;

    .number-input:hover & {
      display: block;
    }

    .active & {
      background-color: #222222;
    }
    :not(.focused, .active) &:hover {
      background-color: #797979;
    }
    &.left {
      left: 0;
      background-image: var(--icon-chevron-left);
    }
    &.right {
      right: 0;
      background-image: var(--icon-chevron-right);
    }
  }
</style>
