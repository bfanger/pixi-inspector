<script lang="ts">
  import { css } from "./icons";
</script>

<div class="base" style={css()}><slot /></div>

<style>
  .base {
    font:
      13px/1.3 system-ui,
      sans-serif;
    height: 100vh;
    -webkit-font-smoothing: antialiased;
    text-shadow: 0 1px 1px rgba(black, 0.4);
  }
</style>
