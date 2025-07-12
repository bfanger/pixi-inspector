<script lang="ts">
  import { tick } from "svelte";
  import blurOnEnter from "../actions/blurOnEnter";
  import revertOnEscape from "../actions/revertOnEscape";
  import selectOnFocus from "../actions/selectOnFocus";

  type Props = {
    value: string;
    setValue?: (value: string) => void;
    id?: string | undefined;
    oninput?: (value: string) => void;
  };

  let {
    value = $bindable(),
    setValue,
    id = undefined,
    oninput,
  }: Props = $props();

  let el: HTMLInputElement | HTMLTextAreaElement | undefined = $state();
  let text = $state(value);
  let previous = $state(value);
  let multiline = $state(false);

  $effect(() => {
    if (text !== value && document.activeElement !== el) {
      text = value;
      multiline = text.includes("\n");
    }
    if (text.includes("\n")) {
      multiline = true;
    }
  });

  function onInput() {
    if (text !== value) {
      value = text;
      oninput?.(value);
    }
  }
  function onFocus() {
    previous = text;
  }
  function onBlur() {
    if (!el) {
      return;
    }
    if (previous !== text) {
      value = text;
      setValue?.(text);
    }
    if (el.tagName === "TEXTAREA" && !text.includes("\n")) {
      multiline = false;
    }
  }
  async function onKeydown(e: KeyboardEvent) {
    if (!el) {
      return;
    }
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
      oninput={onInput}
      onblur={onBlur}
    ></textarea>
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
    onkeydown={onKeydown}
    oninput={onInput}
    onfocus={onFocus}
    onblur={onBlur}
  />
{/if}

<style>
  .text-field {
    position: relative;
    width: 100%;
  }

  .input,
  .textarea,
  .spacer {
    appearance: none;
    display: block;
    font:
      12px system-ui,
      sans-serif;
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
    box-shadow: 0 1px 3px #0000004d;
    border-radius: 4px;

    &::selection {
      background-color: #4570b5;
    }
    &:hover:not(:global(:focus)) {
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
