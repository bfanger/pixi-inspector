<script lang="ts">
  import { Bridge } from "./types";
  import isConnected from "./isConnected";
  import { setBridgeContext } from "./bridge-fns";
  import Outline from "./Outline.svelte";

  export let bridge: Bridge;

  setBridgeContext(bridge);
  const connected = isConnected(bridge);
</script>

{#if $connected}
  <Outline path="stage" level={0} />
{:else}
  No Pixi application configured for debugging.
{/if}
