<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import blurOnEnter from "../actions/blurOnEnter";
  import revertOnEscape from "../actions/revertOnEscape";
  import selectOnFocus from "../actions/selectOnFocus";

  export let value: string;
  export let id: string | undefined = undefined;

  const dispatch = createEventDispatcher();

  let el: HTMLInputElement;
  let text = value;
  let previous = value;

  $: if (text !== value && document.activeElement !== el) {
    text = value;
  }

  function onInput() {
    if (text !== value) {
      value = text;
      dispatch("input", value);
    }
  }
  function onFocus() {
    previous = text;
  }
  function onBlur() {
    if (previous !== text) {
      value = text;
      dispatch("change", text);
    }
  }
</script>

<input
  {id}
  type="text"
  class="input"
  bind:this={el}
  bind:value={text}
  spellcheck="false"
  use:blurOnEnter
  use:revertOnEscape={previous}
  use:selectOnFocus
  on:input={onInput}
  on:focus={onFocus}
  on:blur={onBlur}
/>

<style lang="scss">
  .input {
    font: 12px system-ui, sans-serif;
    background-color: transparent;
    border: none;
    width: 100%;
    box-sizing: border-box;
    color: #fdfdfd;
    outline: none;
    caret-color: #71a8ff;
    padding: 2px 6px;
    background: #1d1d1d;
    border: 1px solid #3d3d3d;
    box-shadow: 0 1px 3px rgba(black, 0.3);
    border-radius: 4px;

    &::selection {
      background-color: #4570b5;
    }
    &:hover:not(:focus) {
      background: #232323;
      border-color: #414141;
    }
    &:focus {
      cursor: text;
    }
  }
</style>
