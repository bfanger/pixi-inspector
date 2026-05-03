<script lang="ts">
  import type { Snippet } from "svelte";
  import IconButton from "../IconButton.svelte";

  type Props = {
    indent: number;
    label: string;
    expanded?: boolean | undefined;
    setExpanded?: (expanded: boolean) => void;
    active?: boolean;
    autofocus?: boolean;
    onclick?: () => void;
    ondblclick?: () => void;
    onkeydown?: (event: { key: string }) => void;
    onmouseenter?: () => void;
    onmouseleave?: () => void;
    children?: Snippet;
  };

  let {
    indent,
    label,
    expanded,
    setExpanded,
    active,
    autofocus,
    onclick,
    ondblclick,
    onkeydown,
    children,
    onmouseenter,
    onmouseleave,
  }: Props = $props();

  let el: HTMLDivElement | undefined = $state();

  $effect(() => {
    if (el && autofocus) {
      el.focus();
      autofocus = undefined;
    }
  });

  const keys = ["ArrowUp", "ArrowRight", "ArrowDown", "ArrowLeft"];
  function onKeyDown(e: KeyboardEvent) {
    if (keys.includes(e.key)) {
      e.preventDefault();
    }
    onkeydown?.({ key: e.key });
  }
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  bind:this={el}
  class="treeview-row"
  class:active
  style:--indent={indent}
  tabindex="0"
  onclick={() => onclick?.()}
  ondblclick={() => ondblclick?.()}
  onmouseenter={() => onmouseenter?.()}
  onmouseleave={() => onmouseleave?.()}
  onkeydown={onKeyDown}
>
  {#if expanded === true}
    <IconButton icon="expanded" onclick={() => setExpanded?.(false)} />
  {:else if expanded === false}
    <IconButton icon="collapsed" onclick={() => setExpanded?.(true)} />
  {:else}
    <div class="toggle-spacer"></div>
  {/if}

  <div class="label">{label}</div>
  {@render children?.()}
</div>

<style>
  .treeview-row {
    display: flex;
    align-items: center;

    height: 20px;
    padding-right: 4px;
    padding-left: calc(var(--indent) * 20px);

    color: #c2c2c2;

    outline: none;

    &:hover {
      background-color: #444;
    }

    &:focus {
      background-color: #334d80;

      &:hover {
        background-color: #4772b3;
      }
    }

    &.active {
      color: #ffaf29;
    }
  }

  .toggle-spacer {
    width: 20px;
  }

  .label {
    user-select: none;
    overflow: hidden;
    flex: 1;
    text-overflow: ellipsis;
  }
</style>
