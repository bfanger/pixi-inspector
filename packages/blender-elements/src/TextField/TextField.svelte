<script lang="ts">
  import { createEventDispatcher, tick } from "svelte";
  import blurOnEnter from "../actions/blurOnEnter";
  import revertOnEscape from "../actions/revertOnEscape";
  import selectOnFocus from "../actions/selectOnFocus";

  export let value: string;
  export let id: string | undefined = undefined;

  const dispatch = createEventDispatcher();

  let el: HTMLInputElement | HTMLTextAreaElement;
  let text = value;
  let previous = value;
  let multiline = false;

  $: if (text !== value && document.activeElement !== el) {
    text = value;
    multiline = text.includes("\n");
  }
  $: if (text.includes("\n")) {
    multiline = true;
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
    if (el.tagName === "TEXTAREA" && !text.includes("\n")) {
      multiline = false;
    }
  }
  async function onKeydown(e: KeyboardEvent) {
    if (e.key === "Enter" && e.shiftKey) {
      const { selectionStart } = el;
      multiline = true;
      await tick();
      el.focus();
      el.selectionStart = selectionStart;
      el.selectionEnd = selectionStart;
    }
  }
</script>

{#if multiline}
  <div class="text-field">
    <div class="spacer">&nbsp;{text}&nbsp;</div>
    <textarea
      {id}
      class="textarea"
      bind:this={el}
      bind:value={text}
      use:blurOnEnter
      use:revertOnEscape={previous}
      on:input={onInput}
      on:blur={onBlur}
    />
  </div>
{:else}
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
    on:keydown={onKeydown}
    on:input={onInput}
    on:focus={onFocus}
    on:blur={onBlur}
  />
{/if}

<style lang="scss">
  .text-field {
    position: relative;
    width: 100%;
  }

  .input,
  .textarea,
  .spacer {
    appearance: none;
    display: block;
    font: 12px system-ui, sans-serif;
    background-color: transparent;
    border: none;
    width: 100%;
    box-sizing: border-box;
    color: #fdfdfd;
    outline: none;
    caret-color: #71a8ff;
    padding: 2px 6px;
    margin: 0;
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
  .spacer {
    position: relative;
    white-space: pre-wrap;
    width: 100%;
    visibility: hidden;
  }
  .textarea {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    resize: none;
    overflow-y: hidden;
  }
</style>
