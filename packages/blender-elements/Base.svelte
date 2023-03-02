<script lang="ts">
  import icons from "./icons";
</script>

<div class="base" style={icons()}><slot /></div>

<style lang="scss">
  .base {
    font: 13px system-ui, sans-serif;
    height: 100vh;
    -webkit-font-smoothing: antialiased;
    text-shadow: 0 1px 1px rgba(black, 0.4);
  }
</style>
