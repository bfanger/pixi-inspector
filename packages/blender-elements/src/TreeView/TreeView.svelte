<script lang="ts">
  import type { Snippet } from "svelte";

  type Props = {
    children: Snippet;
  };
  let { children }: Props = $props();
</script>

<div class="treeview">
  {@render children()}
</div>

<style>
  .treeview {
    overflow: auto;
    height: 100%;
    background-image: linear-gradient(
      to bottom,
      #282828 50%,
      #2b2b2b 50%,
      #2b2b2b
    );
    background-size: 100% 40px;
  }
</style>
