<script lang="ts">
  import { getBridgeContext } from "./bridge-fns";
  import { fade } from "svelte/transition";
  import Warning from "blender-elements/src/Warning/Warning.svelte";

  type Props = {
    onload: () => void;
  };
  let { onload }: Props = $props();
  const bridge = getBridgeContext();
  let promise = load()
    .then(bridge)
    .then(() => {
      onload();
    });

  async function load() {
    //@ts-ignore
    const module = await import("../build/ui-legacy.txt?raw");
    return module.default as string;
  }
</script>

{#await promise}
  <div in:fade={{ delay: 100, duration: 100 }}>Loading...</div>
{:catch err}
  <Warning message={err.message} />
{/await}
