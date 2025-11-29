<script lang="ts">
  import type { Snippet } from "svelte";
  import { css } from "./icons";

  type Props = {
    children?: Snippet;
  };
  let { children }: Props = $props();
</script>

<div class="base" style={css()}>{@render children?.()}</div>

<style>
  .base {
    height: 100%;

    font:
      11px/1.3 system-ui,
      sans-serif;
    color: #e5e5e5;
    text-shadow: 0 1px 1px #0006;

    background: #161616;

    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
</style>
