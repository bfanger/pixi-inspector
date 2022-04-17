<script lang="ts">
  import { Bridge } from "./types";
  import isConnected from "./isConnected";
  import { setBridgeContext } from "./bridge-fns";
  import Outline from "./Outline.svelte";

  export let bridge: Bridge;

  setBridgeContext(bridge);
  const connected = isConnected(bridge);
</script>

<div>
  <button on:click={() => location.reload()}>Reload Panel</button>
</div>

{#if $connected}
  <Outline />
{:else}
  No Pixi application configured for debugging.
{/if}
