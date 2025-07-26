<script lang="ts">
  import { setContext, type Snippet } from "svelte";
  import Tree from "../../../../pixi-panel/src/Tree.svelte";
  import type { OutlinerNode } from "../../../../pixi-panel/src/types";
  import Warning from "../../../../pixi-panel/src/Warning.svelte";

  type Props = {
    value: OutlinerNode;
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
    children: Snippet;
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
    children,
  }: Props = $props();

  const ctx = setContext("scene-graph", { focused: false });
</script>

<div class="scene-graph-legacy">
  <div class="search-field">
    {@render children()}
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
      <Warning>No scene detected.</Warning>
    {/if}
  </div>
</div>

<style>
  .scene-graph-legacy {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .search-field {
    position: sticky;
    padding: 3px 8px 5px;
    background: #2d2d2d;
  }

  .tree {
    overflow-y: auto;
    flex: 1;
  }
</style>
