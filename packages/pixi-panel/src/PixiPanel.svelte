<script lang="ts">
  import Base from "blender-elements/src/Base.svelte";
  import Button from "blender-elements/src/Button/Button.svelte";
  import type { BridgeFn } from "./types";
  import { setBridgeContext } from "./bridge-fns";
  import connect from "./connect";
  import Instructions from "./Instructions.svelte";
  import patchPixi from "./patchPixi";
  import PropertiesArea from "./PropertiesArea.svelte";
  import SceneGraphArea from "./SceneGraphArea.svelte";
  import Warning from "./Warning.svelte";

  type Props = {
    bridge: BridgeFn;
  };

  let { bridge }: Props = $props();

  let refresh: () => void = $state(undefined as any);

  const connection = connect(bridge);
  const { error } = connection;

  setBridgeContext(<T,>(code: string) =>
    bridge<T>(code).catch((err) => {
      connection.retry();
      throw err;
    }),
  );
  async function applyPatch() {
    await patchPixi(bridge);
    connection.retry();
  }
</script>

<Base>
  {#if $connection === "CONNECTED"}
    <div class="pixi-panel">
      <div class="outliner">
        <SceneGraphArea onactivate={refresh} />
      </div>
      <div class="properties">
        <PropertiesArea bind:refresh />
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
            <Button onclick={applyPatch}>Patch render engine</Button>
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

<style>
  :global(body) {
    margin: 0;
    color: #e5e5e5;
    background: #161616;
  }

  :global(code) {
    display: block;
    padding: 8px;
  }

  .pixi-panel {
    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: minmax(50px, 1fr) minmax(210px, 55%);
    gap: 3px;

    height: 100%;

    @media (width >= 600px) {
      grid-template-columns: 1fr minmax(300px, 40%);
      grid-template-rows: 1fr;
    }
  }

  .outliner {
    overflow: auto;
    background: #303030;
  }

  .properties {
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
    overflow: auto;
    flex: 1;
  }

  .status {
    margin: 0 2px 2px;
  }
</style>
