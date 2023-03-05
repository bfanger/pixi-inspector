<script lang="ts">
  import type { BridgeFn } from "./types";
  import connect from "./connect";
  import { setBridgeContext } from "./bridge-fns";
  import SceneGraph from "./SceneGraph.svelte";
  import Base from "blender-elements/Base.svelte";
  import Properties from "./Properties.svelte";
  import Instructions from "./Instructions.svelte";

  export let bridge: BridgeFn;

  let refresh: () => void;

  const connection = connect(bridge);

  setBridgeContext(<T>(code: string) =>
    bridge<T>(code).catch((err) => {
      connection.retry();
      throw err;
    })
  );
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
    <Instructions />
  {/if}
</Base>

<style lang="scss">
  :global {
    body {
      margin: 0;
      background: #161616;
      color: #e5e5e5;
    }
    code {
      display: block;
      padding: 8px;
    }
  }
  .pixi-panel {
    display: grid;
    grid-template-rows: minmax(50px, 1fr) minmax(210px, 55%);
    grid-template-columns: 1fr;
    height: 100%;
    gap: 3px;
    @media (min-width: 600px) {
      grid-template-rows: 1fr;
      grid-template-columns: 1fr minmax(300px, 40%);
    }
  }
  .outliner {
    overflow: auto;
    background: #303030;
  }
  .properties {
    background: #303030;
    overflow: auto;
  }
</style>
