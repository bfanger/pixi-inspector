<script lang="ts">
  import type { BridgeFn } from "./types";
  import connect from "./connect";
  import { setBridgeContext } from "./bridge-fns";
  import SceneGraph from "./SceneGraph.svelte";
  import Base from "blender-elements/Base.svelte";
  import Properties from "./Properties.svelte";

  export let bridge: BridgeFn;

  let refresh: () => void;

  setBridgeContext(bridge);
  const connection = connect(bridge);
</script>

<Base>
  {#if $connection}
    <div class="pixi-panel">
      <div class="outliner">
        <SceneGraph on:activate={refresh} />
      </div>
      <div class="properties">
        <Properties bind:refresh />
      </div>
    </div>
  {:else}
    <div class="info">
      No Pixi application configured for debugging.<br /><br />
      To enable debugging, after creating the PIXI.Application
      <code>const app = new PIXI.Application(...);</code>
      add the line:
      <code>window.__PIXI_APP__ = app;</code>
    </div>
  {/if}
</Base>

<style lang="scss">
  :global {
    body {
      margin: 0;
      background: #161616; //  #303030;;
      color: #e5e5e5;
    }
    code {
      display: block;
      padding: 8px;
    }
  }
  .pixi-panel {
    display: flex;
    flex-direction: column;
    height: 100%;
    gap: 3px;
  }
  .outliner {
    flex: 1;
    max-height: 50%;
    overflow: scroll;
    background: #303030;
  }
  .properties {
    background: #303030;
    flex-grow: 1;
  }
  .info {
    padding: 8px;
  }
</style>
