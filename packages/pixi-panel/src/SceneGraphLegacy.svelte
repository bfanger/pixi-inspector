<script lang="ts">
  import { setContext, type Snippet } from "svelte";
  import Tree from "./Tree.svelte";
  import type { OutlinerNode } from "./types";

  type Props = {
    value: OutlinerNode | false;
    onexpand: (path: string[]) => void;
    oncollapse: (path: string[]) => void;
    onactivate: (path: string[]) => void;
    onselectable: (path: string[]) => void;
    onunselectable: (path: string[]) => void;
    onshow: (path: string[]) => void;
    onhide: (path: string[]) => void;
    onlog: (path: string[]) => void;
    onmouseenter: (path: string[]) => void;
    onmouseleave: (path: string[]) => void;
    search: Snippet;
    tree: Snippet;
  };
  let {
    value,
    onexpand,
    oncollapse,
    onactivate,
    onselectable,
    onunselectable,
    onshow,
    onhide,
    onlog,
    onmouseenter,
    onmouseleave,
    search,
    tree,
  }: Props = $props();

  const ctx = setContext("scene-graph", { focused: false });
</script>

<div class="scene-graph-legacy">
  <div class="search-input">
    {@render search()}
  </div>
  <div
    class="tree"
    onfocusin={() => (ctx.focused = true)}
    onfocusout={() => (ctx.focused = false)}
  >
    {#if value}
      <Tree
        id={value.id}
        name={value.name}
        leaf={value.leaf}
        active={value.active}
        visible={value.visible}
        selectable={value.selectable}
        match={value.match}
        children={value.children}
        {onexpand}
        {oncollapse}
        {onactivate}
        {onselectable}
        {onunselectable}
        {onshow}
        {onhide}
        {onlog}
        {onmouseenter}
        {onmouseleave}
      />
    {:else}
      {@render tree?.()}
    {/if}
  </div>
</div>

<style>
  .scene-graph-legacy {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: #2d2d2d;
  }

  .search-input {
    position: sticky;
    padding: 8px;
  }

  .tree {
    overflow-y: auto;
    flex: 1;
  }
</style>
