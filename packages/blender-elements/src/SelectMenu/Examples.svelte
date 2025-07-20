<script lang="ts">
  import Panel from "../Panel/Panel.svelte";
  import Property from "../Property/Property.svelte";
  import SelectMenu from "./SelectMenu.svelte";

  let value = $state("Both");
</script>

<div style="max-width: 300px">
  <Panel title="Select Menu">
    <Property label="Fill Mode">
      <SelectMenu bind:value options={["None", "Back", "Front", "Both"]} />
    </Property>
  </Panel>
</div>
