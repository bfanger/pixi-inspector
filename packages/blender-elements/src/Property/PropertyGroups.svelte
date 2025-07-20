<script lang="ts">
  import type { Snippet } from "svelte";

  type Props = {
    children: Snippet;
  };
  let { children }: Props = $props();
</script>

<div class="property-groups">
  {@render children()}
</div>

<style>
  .property-groups {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
</style>
