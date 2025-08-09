<script lang="ts">
  import SplitPanels from "./SplitPanels.svelte";
  import SplitPanel from "./SplitPanel.svelte";

  let size = $state(2);
</script>

<div style="display: grid; min-height: calc(100svh - 32px);">
  <SplitPanels direction="column">
    <SplitPanel min={16}
      ><div class="example-panel" style:background-color="lawngreen">
        1
      </div></SplitPanel
    >
    <SplitPanel {size} min={100}
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
    overflow: auto;
    display: flow-root;

    box-sizing: border-box;
    height: 100%;
    border: 1px solid #3c3c3c;
    border-radius: 4px;
  }
</style>
