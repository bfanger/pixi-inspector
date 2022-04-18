<script lang="ts">
  import type { BridgeFn } from "./types";
  import isConnected from "./isConnected";
  import { setBridgeContext } from "./bridge-fns";
  import SceneGraph from "./SceneGraph.svelte";
  import ReloadButton from "./ReloadButton.svelte";
  import Base from "blender-elements/Base.svelte";

  export let bridge: BridgeFn;

  setBridgeContext(bridge);
  const connected = isConnected(bridge);
</script>

<Base>
  {#if $connected}
    <SceneGraph />
  {:else}
    No Pixi application configured for debugging. After
    <code>const app = new PIXI.Application(...);</code>
    Add:
    <code>window['__PIXI_APP__'] = app;</code>
    <ReloadButton />
  {/if}
</Base>
