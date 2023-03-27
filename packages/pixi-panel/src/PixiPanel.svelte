<script lang="ts">
  import type { BridgeFn } from "./types";
  import connect from "./connect";
  import { setBridgeContext } from "./bridge-fns";
  import SceneGraph from "./SceneGraph.svelte";
  import Base from "blender-elements/src/Base.svelte";
  import Properties from "./Properties.svelte";
  import Instructions from "./Instructions.svelte";
  import Warning from "./Warning.svelte";
  import patchPixi from "./patchPixi";
  import Button from "blender-elements/src/Button.svelte";

  export let bridge: BridgeFn;

  let refresh: () => void;

  const connection = connect(bridge);
  const { error } = connection;

  setBridgeContext(<T>(code: string) =>
    bridge<T>(code).catch((err) => {
      connection.retry();
      throw err;
    })
  );
  async function applyPatch() {
    await patchPixi(bridge);
    await connection.retry();
  }
</script>

<Base>
  {#if $connection === "CONNECTED"}
    <div class="pixi-panel">
      <div class="outliner">
        <SceneGraph on:activate={refresh} />
      </div>
      <div class="properties">
        <Properties bind:refresh />
      </div>
    </div>
  {:else if $connection !== "INJECT"}
    <div class="not-connected">
      <div class="instructions">
        <Instructions />
      </div>
      <div class="status">
        {#if $connection === "NOT_FOUND"}
          <Warning>No Application or Game configured for debugging</Warning>
        {:else if $connection === "DISCONNECTED"}
          <Warning>Connection lost</Warning>
        {:else if $connection === "PATCHABLE"}
          <div class="patch">
            <Button on:click={applyPatch}>Patch render engine</Button>
          </div>
          <Warning
            >"Patch render engine" is available. This type of Devtools
            connection is less reliable</Warning
          >
        {:else if $connection === "ERROR"}
          <Warning icon="error">{$error}</Warning>
        {:else}
          <Warning icon="error">{$connection}</Warning>
        {/if}
      </div>
    </div>
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
  .patch {
    margin: 4px 12px;
  }
  .not-connected {
    display: flex;
    flex-direction: column;
    height: 100%;
  }
  .instructions {
    flex: 1;
    overflow: auto;
  }
  .status {
    margin: 0 2px 2px 2px;
  }
</style>
