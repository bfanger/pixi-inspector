<script lang="ts">
  import { fade } from "svelte/transition";
  import Warning from "blender-elements/src/Warning/Warning.svelte";

  type Props = {
    onload: (uiLegacy: string) => void;
  };
  let { onload }: Props = $props();

  async function load() {
    //@ts-ignore
    const module = await import("../build/ui-legacy.txt?raw");
    onload(module.default as string);
  }
</script>

{#await load()}
  <div in:fade={{ delay: 100, duration: 100 }}>Loading...</div>
{:catch err}
  <Warning message={err.message} />
{/await}
