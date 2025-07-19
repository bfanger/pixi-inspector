<script lang="ts">
  import SelectMenu from "./SelectMenu.svelte";

  let value = $state("Both");
  const options = ["None", "Back", "Front", "Both"];
</script>

<div style="max-width: 200px">
  <SelectMenu legend="Fill Mode" bind:value {options} />
</div>
