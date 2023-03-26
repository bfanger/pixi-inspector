<script lang="ts">
  import Base from "../Base.svelte";
  import Toggle from "./Toggle.svelte";
  import { type Icon, icons } from "../icons";

  export let Hst: any;

  let value = false;
  let icon: Icon = "copy";
</script>

<Hst.Story>
  <Base>
    <Toggle bind:icon bind:value />
    <Toggle bind:icon />
    <Toggle bind:icon transparent />
    <br />
    <div style="display:inline-flex">
      <Toggle icon="chevron-left" location="LEFT" />
      <Toggle icon="eye-opened" bind:value location="CENTER" />
      <Toggle icon="chevron-right" location="RIGHT" />
    </div>
  </Base>
  <svelte:fragment slot="controls">
    <Hst.Checkbox bind:value title="value" />
    <Hst.Radio bind:value={icon} title="icon" options={icons} />
  </svelte:fragment>
</Hst.Story>
