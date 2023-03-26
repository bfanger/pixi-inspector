<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import blurOnEnter from "../actions/blurOnEnter";
  import revertOnEscape from "../actions/revertOnEscape";
  import selectOnFocus from "../actions/selectOnFocus";

  export let value: string;
  export let id: string | undefined = undefined;

  const dispatch = createEventDispatcher();

  let text = value;
  let previous = value;

  function onInput() {
    if (text !== value) {
      value = text;
      dispatch("change", value);
    }
  }
  function onFocus() {
    previous = text;
  }
  function clear() {
    text = "";
    dispatch("change", text);
  }
</script>

<div class="search-input">
  <input
    {id}
    type="text"
    class="input"
    bind:value={text}
    spellcheck="false"
    use:blurOnEnter
    use:revertOnEscape={previous}
    use:selectOnFocus
    on:input={onInput}
    on:focus={onFocus}
  />
  <div class="search-icon" />
  {#if value !== ""}
    <button class="clear" on:click={clear} />
  {/if}
</div>

<style lang="scss">
  .search-input {
    position: relative;
  }
  .input {
    font: 12px system-ui, sans-serif;
    background-color: transparent;
    border: none;
    width: 100%;
    box-sizing: border-box;
    color: #fdfdfd;
    outline: none;
    caret-color: #71a8ff;
    padding: 2px 20px 2px 25px;
    background: #1d1d1d;
    border: 1px solid #3d3d3d;
    box-shadow: 0 1px 3px rgba(black, 0.3);
    border-radius: 4px;
    cursor: default;

    &::selection {
      background-color: #4570b5;
    }
    .search-input:hover &:not(:focus) {
      background: #232323;
      border-color: #414141;
    }
    &:focus {
      cursor: text;
    }
  }
  .search-icon {
    position: absolute;
    top: calc(50% - 8px);
    left: 4px;
    background: var(--icon-search) center center no-repeat;
    width: 16px;
    height: 16px;
  }
  .clear {
    position: absolute;
    top: 0;
    right: 0;
    width: 20px;
    height: 100%;
    background: var(--icon-cross) center center no-repeat;
    border: none;
    opacity: 0.8;
    cursor: pointer;

    &:hover {
      opacity: 1;
    }
  }
</style>
