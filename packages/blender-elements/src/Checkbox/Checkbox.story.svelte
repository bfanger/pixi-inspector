<script lang="ts">
  import Base from "../Base.svelte";
  import Checkbox from "./Checkbox.svelte";

  export let Hst: any;

  let value = false;
  let viewports = true;
  let renders = true;
</script>

<Hst.Story>
  <Base>
    <Checkbox bind:value>Selectable</Checkbox>
    <Checkbox bind:value={viewports}>Viewports</Checkbox>
    <Checkbox
      value={renders}
      on:change={({ detail }) => {
        renders = detail;
      }}
    >
      Renders
    </Checkbox>
  </Base>
  <svelte:fragment slot="controls">
    <Hst.Checkbox bind:value title="value" />
  </svelte:fragment>
</Hst.Story>
