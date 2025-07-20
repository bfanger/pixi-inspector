<script lang="ts">
  import type { Snippet } from "svelte";

  type Props = {
    children: Snippet;
  };
  let { children }: Props = $props();
</script>

<div class="property-group">
  {@render children()}
</div>

<style>
  .property-group {
    display: flex;
    flex-direction: column;
    gap: 1px;
  }
</style>
