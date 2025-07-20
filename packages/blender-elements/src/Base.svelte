<script lang="ts">
  import { css } from "./icons";
  type Props = {
    children?: import("svelte").Snippet;
  };

  let { children }: Props = $props();
</script>

<div class="base" style={css()}>{@render children?.()}</div>

<style>
  .base {
    height: 100vh;
    font:
      13px/1.3 system-ui,
      sans-serif;
    -webkit-font-smoothing: antialiased;
    text-shadow: 0 1px 1px #0006;
  }
</style>
