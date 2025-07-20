<script lang="ts">
  import blurOnEnter from "../actions/blurOnEnter";
  import revertOnEscape from "../actions/revertOnEscape";
  import selectOnFocus from "../actions/selectOnFocus";

  type Props = {
    value: string;
    id?: string | undefined;
    onchange?: (value: string) => void;
  };

  let { value = $bindable(), id = undefined, onchange }: Props = $props();

  let text = $state(value);
  let previous = $state(value);

  function onInput() {
    if (text !== value) {
      value = text;
      onchange?.(value);
    }
  }
  function onFocus() {
    previous = text;
  }
  function clear() {
    text = "";
    value = "";
    onchange?.(text);
  }
</script>

<div class="search-field">
  <input
    {id}
    type="text"
    class="input"
    bind:value={text}
    spellcheck="false"
    use:blurOnEnter
    use:revertOnEscape={previous}
    use:selectOnFocus
    oninput={onInput}
    onfocus={onFocus}
  />
  <div class="search-icon"></div>
  {#if value !== ""}
    <button class="clear" onclick={clear} aria-label="clear"></button>
  {/if}
</div>

<style>
  .search-field {
    position: relative;
  }

  .input {
    cursor: default;

    box-sizing: border-box;
    width: 100%;
    padding: 2px 20px 2px 25px;
    border: none;
    border: 1px solid #3d3d3d;
    border-radius: 4px;

    font:
      12px system-ui,
      sans-serif;
    color: #fdfdfd;

    background: #1d1d1d;
    background-color: transparent;
    outline: none;
    box-shadow: 0 1px 3px #0000004d;
    caret-color: #71a8ff;

    &::selection {
      background-color: #4570b5;
    }

    &:focus {
      cursor: text;
    }
  }

  .search-field:hover .input:not(:global(:focus)) {
    border-color: #414141;
    background: #232323;
  }

  .search-icon {
    position: absolute;
    top: calc(50% - 8px);
    left: 4px;

    width: 16px;
    height: 16px;

    background: var(--icon-search) center center no-repeat;
  }

  .clear {
    cursor: pointer;

    position: absolute;
    top: 0;
    right: 0;

    width: 20px;
    height: 100%;
    border: none;

    opacity: 0.8;
    background: var(--icon-cross) center center no-repeat;

    &:hover {
      opacity: 1;
    }
  }
</style>
