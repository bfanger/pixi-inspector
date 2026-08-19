<script lang="ts">
  import type { Snippet } from "svelte";

  type Props = {
    toolbar: Snippet;
    children: Snippet;
  };
  let { toolbar, children }: Props = $props();
</script>

<div class="region">
  <div class="toolbar">
    {@render toolbar()}
  </div>
  <div class="children">
    {@render children()}
  </div>
</div>

<style>
  .region {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .toolbar {
    flex-shrink: 0;
    background: #282828;
  }

  .children {
    overflow-y: auto;
    flex: 1;
  }
</style>
