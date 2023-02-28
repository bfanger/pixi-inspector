<script lang="ts">
  import icons from "./icons";
</script>

<div class="base" style={icons()}><slot /></div>

<style lang="scss">
  .base {
    font: 12px system-ui, sans-serif;
    height: 100vh;
    text-shadow: 0 1px 1px rgba(black, 0.8);
    -webkit-font-smoothing: antialiased;
  }
</style>
