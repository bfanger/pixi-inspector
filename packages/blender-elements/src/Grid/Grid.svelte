<script lang="ts">
  import type { Snippet } from "svelte";

  type Props = {
    cols: number;
    gap?: string | number;
    children: Snippet;
  };
  let { cols, gap, children }: Props = $props();
</script>

<div
  class="grid"
  style:grid-template-columns="repeat({cols}, 1fr)"
  style:gap={typeof gap === "number" ? `${gap}px` : gap}
>
  {@render children()}
</div>

<style>
  .grid {
    display: grid;
  }
</style>
