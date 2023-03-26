<script lang="ts">
  import { createEventDispatcher, setContext } from "svelte";
  import SearchInput from "blender-elements/src/SearchInput/SearchInput.svelte";
  import { getBridgeContext, poll } from "./bridge-fns";
  import Tree from "./Tree.svelte";
  import type { OutlinerNode } from "./types";
  import Warning from "./Warning.svelte";

  const dispatch = createEventDispatcher();
  const bridge = getBridgeContext();
  const ctx = setContext("scene-graph", { focused: false });

  const tree = poll<OutlinerNode>(
    bridge,
    "__PIXI_DEVTOOLS__.outline.tree()",
    2000
  );
  $: stage = $tree.data;
  $: error = $tree.error;

  let query = "";
  let el: HTMLDivElement;

  $: {
    bridge(`__PIXI_DEVTOOLS__.outline.query = ${JSON.stringify(query)}`).then(
      () => tree.sync()
    );
  }

  async function expand(path: string[]) {
    if (query) {
      return;
    }
    await bridge(`__PIXI_DEVTOOLS__.outline.expand(${JSON.stringify(path)})`);
    tree.sync();
  }
  async function collapse(path: string[]) {
    if (query) {
      return;
    }
    await bridge(`__PIXI_DEVTOOLS__.outline.collapse(${JSON.stringify(path)})`);
    tree.sync();
  }
  async function activate(path: string[]) {
    await bridge(`__PIXI_DEVTOOLS__.outline.activate(${JSON.stringify(path)})`);
    tree.sync();
    dispatch("activate");
  }
  async function selectable(path: string[]) {
    await bridge(
      `__PIXI_DEVTOOLS__.outline.selectable(${JSON.stringify(path)})`
    );
    tree.sync();
  }
  async function unselectable(path: string[]) {
    await bridge(
      `__PIXI_DEVTOOLS__.outline.unselectable(${JSON.stringify(path)})`
    );
    tree.sync();
  }
  async function show(path: string[]) {
    await bridge(`__PIXI_DEVTOOLS__.outline.show(${JSON.stringify(path)})`);
    tree.sync();
  }
  async function hide(path: string[]) {
    await bridge(`__PIXI_DEVTOOLS__.outline.hide(${JSON.stringify(path)})`);
    tree.sync();
  }
  async function log(path: string[]) {
    await bridge(`__PIXI_DEVTOOLS__.outline.log(${JSON.stringify(path)})`);
  }
  function onFocusIn() {
    ctx.focused = true;
  }
  function onFocusOut() {
    ctx.focused = false;
  }
</script>

<div class="scene-graph">
  <div class="header">
    <SearchInput bind:value={query} />
  </div>
  <div
    class="body"
    bind:this={el}
    on:focusin={onFocusIn}
    on:focusout={onFocusOut}
  >
    {#if error}
      <Warning>{error.message}</Warning>
    {/if}
    {#if stage}
      <Tree
        id={stage.id}
        name={stage.name}
        leaf={stage.leaf}
        active={stage.active}
        visible={stage.visible}
        selectable={stage.selectable}
        match={stage.match}
        children={stage.children}
        on:expand={({ detail }) => expand(detail)}
        on:collapse={({ detail }) => collapse(detail)}
        on:activate={({ detail }) => activate(detail)}
        on:selectable={({ detail }) => selectable(detail)}
        on:unselectable={({ detail }) => unselectable(detail)}
        on:show={({ detail }) => show(detail)}
        on:hide={({ detail }) => hide(detail)}
        on:log={({ detail }) => log(detail)}
      />
    {/if}
  </div>
</div>

<style>
  .scene-graph {
    display: flex;
    flex-direction: column;
    height: 100%;
  }
  .header {
    position: sticky;
    padding: 3px 8px 5px 8px;
    background: #2d2d2d;
  }
  .body {
    flex: 1;
    overflow-y: auto;
  }
</style>
