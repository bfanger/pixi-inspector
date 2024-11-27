<script lang="ts">
  import SearchField from "blender-elements/src/SearchField/SearchField.svelte";
  import { setContext } from "svelte";
  import type { OutlinerNode } from "./types";
  import { getBridgeContext, poll } from "./bridge-fns";
  import Tree from "./Tree.svelte";
  import Warning from "./Warning.svelte";

  type Props = {
    onactivate: () => void;
  };
  const { onactivate }: Props = $props();
  const bridge = getBridgeContext();
  const ctx = setContext("scene-graph", { focused: false });

  const tree = poll<OutlinerNode>(
    bridge,
    "__PIXI_INSPECTOR__.outline.tree()",
    2000,
  );
  let stage = $derived($tree.data);
  let error = $derived($tree.error);

  let query = $state("");
  let el: HTMLDivElement | undefined = $state();

  $effect.pre(() => {
    bridge(`__PIXI_INSPECTOR__.outline.query = ${JSON.stringify(query)}`).then(
      () => tree.sync(),
    );
  });

  async function expand(path: string[]) {
    if (query) {
      return;
    }
    await bridge(`__PIXI_INSPECTOR__.outline.expand(${JSON.stringify(path)})`);
    tree.sync();
  }
  async function collapse(path: string[]) {
    if (query) {
      return;
    }
    await bridge(
      `__PIXI_INSPECTOR__.outline.collapse(${JSON.stringify(path)})`,
    );
    tree.sync();
  }
  async function activate(path: string[]) {
    await bridge(
      `__PIXI_INSPECTOR__.outline.activate(${JSON.stringify(path)})`,
    );
    tree.sync();
    onactivate();
  }
  async function selectable(path: string[]) {
    await bridge(
      `__PIXI_INSPECTOR__.outline.selectable(${JSON.stringify(path)})`,
    );
    tree.sync();
  }
  async function unselectable(path: string[]) {
    await bridge(
      `__PIXI_INSPECTOR__.outline.unselectable(${JSON.stringify(path)})`,
    );
    tree.sync();
  }
  async function show(path: string[]) {
    await bridge(`__PIXI_INSPECTOR__.outline.show(${JSON.stringify(path)})`);
    tree.sync();
  }
  async function hide(path: string[]) {
    await bridge(`__PIXI_INSPECTOR__.outline.hide(${JSON.stringify(path)})`);
    tree.sync();
  }
  async function log(path: string[]) {
    await bridge(`__PIXI_INSPECTOR__.outline.log(${JSON.stringify(path)})`);
  }
  async function highlight(path: string[]) {
    await bridge(
      `__PIXI_INSPECTOR__.outline.highlight(${JSON.stringify(path)})`,
    );
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
    <SearchField bind:value={query} />
  </div>
  <div
    class="body"
    bind:this={el}
    onfocusin={onFocusIn}
    onfocusout={onFocusOut}
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
        onexpand={expand}
        oncollapse={collapse}
        onactivate={activate}
        onselectable={selectable}
        onunselectable={unselectable}
        onshow={show}
        onhide={hide}
        onlog={log}
        onmouseenter={highlight}
        onmouseleave={() => highlight([])}
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
