<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import SearchInput from "blender-elements/SearchInput.svelte";
  import { getBridgeContext, poll } from "./bridge-fns";
  import Tree from "./Tree.svelte";
  import SpeedRange from "./SpeedRange.svelte";
  import type { OutlinerNode } from "./types";
  import Warning from "./Warning.svelte";

  let speed: number;
  const dispatch = createEventDispatcher();
  const bridge = getBridgeContext();
  const tree = poll<OutlinerNode>(
    bridge,
    "__PIXI_DEVTOOLS__.outline.tree()",
    2000
  );
  $: stage = $tree.data;
  $: error = $tree.error;

  let query = "";
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

  async function getSpeed() {
    try {
      speed= await bridge(`__PIXI_DEVTOOLS__.ticker().speed`);
    } catch {}
  }
  async function setSpeed(speed: number) {
    await bridge(`__PIXI_DEVTOOLS__.ticker().speed = ${speed}`);
  }
</script>

<div class="scene-graph">
  <div class="header">
    {#await getSpeed()}
      <p>Waiting for speed info...</p>
    {:then}
      {#if speed}
        <SpeedRange
          value={speed}
          on:change={({ detail }) => setSpeed(detail)}
        />
      {/if}
    {/await}
    <SearchInput bind:value={query} />
  </div>
  <div class="body">
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
        match={stage.match}
        children={stage.children}
        on:expand={({ detail }) => expand(detail)}
        on:collapse={({ detail }) => collapse(detail)}
        on:activate={({ detail }) => activate(detail)}
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
