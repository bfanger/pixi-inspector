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
    display: block;

    box-sizing: border-box;
    width: 100%;
    margin: 0;
    padding: 2px 6px;
    border: none;
    border: 1px solid #3d3d3d;
    border-radius: 4px;

    font: inherit;
    color: #fdfdfd;

    appearance: none;
    background: #1d1d1d;
    background-color: transparent;
    outline: none;
    box-shadow: 0 1px 3px #0000004d;
    caret-color: #71a8ff;

    &::selection {
      background-color: #4570b5;
    }

    &:hover:not(:global(:focus)) {
      border-color: #414141;
      background: #232323;
    }

    /* stylelint-disable-next-line no-descending-specificity */
    &:focus {
      cursor: text;
    }
  }

  /* stylelint-disable-next-line no-descending-specificity */
  .spacer {
    position: relative;
    width: 100%;
    white-space: pre-wrap;
    visibility: hidden;
  }
  /* stylelint-disable-next-line no-descending-specificity */
  .textarea {
    resize: none;

    position: absolute;
    top: 0;
    left: 0;

    overflow-y: hidden;

    width: 100%;
    height: 100%;
  }
</style>
