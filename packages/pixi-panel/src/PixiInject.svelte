<script lang="ts">
  import { getBridgeContext } from "./bridge-fns";
  // @ts-ignore
  import uiLegacy from "../build/ui-legacy.txt?raw";
  import Warning from "./Warning.svelte";
  import { fade } from "svelte/transition";

  type Props = {
    onload?: () => void;
  };
  let { onload }: Props = $props();
  const bridge = getBridgeContext();
  let promise = bridge(uiLegacy).then(() => {
    onload?.();
  });
</script>

{#await promise}
  <div in:fade={{ delay: 100, duration: 100 }}>Loading...</div>
{:catch err}
  <Warning message={err.message} />
{/await}
