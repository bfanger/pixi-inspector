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
  import SplitPanels from "../../blender-elements/src/SplitPanel/SplitPanels.svelte";
  import SplitPanel from "../../blender-elements/src/SplitPanel/SplitPanel.svelte";

  type Props = {
    bridge: BridgeFn;
  };

  let { bridge }: Props = $props();

  let refresh: () => void = $state(undefined as any);
  let width: number = $state(0);

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
      <SplitPanels
        direction={width > 600 ? "row" : "column"}
        onResize={(size) => {
          width = size.width;
        }}
      >
        <SplitPanel minWidth={200} minHeight={100} size={1}>
          <div class="outliner">
            <SceneGraphArea onactivate={refresh} />
          </div>
        </SplitPanel>
        <SplitPanel
          minWidth={200}
          minHeight={200}
          maxHeight={600}
          size={width > 600 ? 1 : 1.5}
        >
          <div class="properties">
            <PropertiesArea bind:refresh />
          </div>
        </SplitPanel>
      </SplitPanels>
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
          <Warning>
            "Patch render engine" is available. This type of Devtools connection
            is less reliable
          </Warning>
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
  .pixi-panel {
    height: 100vh;
  }

  .outliner {
    overflow: auto;
    height: 100%;
    background: #282828;
  }

  .properties {
    overflow: auto;
    height: 100%;
  }

  .patch {
    width: min-content;
    margin: 4px 12px;
  }

  .not-connected {
    display: flex;
    flex-direction: column;
    height: 100vh;
  }

  .instructions {
    overflow: auto;
    flex: 1;
  }

  .status {
    margin: 0 2px 2px;
  }
</style>
