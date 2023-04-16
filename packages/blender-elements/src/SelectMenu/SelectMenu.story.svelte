<script lang="ts">
  import Base from "../Base.svelte";
  import SelectMenu from "./SelectMenu.svelte";

  export let Hst: any;

  let value = "Both";
  const options = ["None", "Back", "Front", "Both"];
</script>

<Hst.Story>
  <Base>
    <div style="max-width: 200px">
      <SelectMenu legend="Fill Mode" bind:value {options} />
    </div>
  </Base>
  <svelte:fragment slot="controls">
    <Hst.Select
      bind:value
      title="value"
      options={["None", "Back", "Front", "Both"]}
    />
  </svelte:fragment>
</Hst.Story>
