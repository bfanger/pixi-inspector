<script lang="ts">
  import SplitPanels from "./SplitPanels.svelte";
  import SplitPanel from "./SplitPanel.svelte";

  let size = $state(2);
</script>

<div style="height: calc(100svh - 30px)">
  <SplitPanels direction="column">
    <SplitPanel
      ><div class="example-panel" style:background-color="lawngreen">
        1
      </div></SplitPanel
    >
    <SplitPanel {size}
      ><div class="example-panel" style:background-color="lightcoral">
        <h1>{size}</h1>
        <button onclick={() => (size = 3)}>Size = 3</button>
        <button onclick={() => (size = 1)}>Size = 1</button>
      </div>
    </SplitPanel>
    <SplitPanel
      ><div class="example-panel" style:background-color="lightskyblue">
        3
      </div></SplitPanel
    >
  </SplitPanels>
</div>

<style>
  .example-panel {
    display: flow-root;
    min-height: 100%;
  }
</style>
