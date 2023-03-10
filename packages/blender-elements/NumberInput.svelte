<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import blurOnEnter from "./blurOnEnter";
  import revertOnEscape from "./revertOnEscape";
  import selectOnFocus from "./selectOnFocus";

  export let value: number | undefined;
  export let suffix = "";
  export let location: "ALONE" | "TOP" | "MIDDLE" | "BOTTOM" = "ALONE";
  export let id: string | undefined = undefined;

  const dispatch = createEventDispatcher();

  let el: HTMLInputElement;
  let wanted = value;
  let text = format(value);

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
    if (suffix && text.endsWith(suffix)) {
      text = text.substring(0, text.length - suffix.length);
      el.value = text;
    }
    el.select();
  }
  function onBlur() {
    text = format(value);
  }
</script>

<input
  {id}
  type="number"
  class="number-input"
  data-location={location}
  use:blurOnEnter
  use:revertOnEscape={value?.toString() ?? ""}
  bind:this={el}
  bind:value={text}
  on:input={onInput}
  on:focus={onFocus}
  on:blur={onBlur}
/>

<style lang="scss">
  .number-input {
    background-color: #545454;
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
    &::selection {
      background-color: #4570b5;
    }
    &:hover {
      background-color: #797979;
      color: #fcfcfc;
    }

    &:focus {
      background-color: #222222;
      color: #e5e5e5;
    }
    &[data-location="ALONE"] {
      border-radius: 2px;
    }
    &[data-location="TOP"] {
      border-top-left-radius: 2px;
      border-top-right-radius: 2px;
      margin-bottom: 0.5px;
    }
    &[data-location="BOTTOM"] {
      border-bottom-left-radius: 2px;
      border-bottom-right-radius: 2px;
    }
  }
</style>
