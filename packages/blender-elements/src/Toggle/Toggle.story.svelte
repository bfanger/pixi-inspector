<script lang="ts">
  import Base from "../Base.svelte";
  import Toggle from "./Toggle.svelte";
  import { type Icon, icons } from "../icons";

  export let Hst: any;

  let value = false;
  let icon: Icon = "copy";
  let font: "bold" | "italic" | "small-caps" = "bold";
</script>

<Hst.Story>
  <Base>
    <Toggle {icon} bind:value />
    <Toggle {icon} />
    <Toggle {icon} transparent />
    <br />
    <div style="display:inline-flex">
      <Toggle icon="chevron-left" location="LEFT" />
      <Toggle icon="eye-opened" bind:value location="CENTER" />
      <Toggle icon="chevron-right" location="RIGHT" />
    </div>

    <div
      style="display: grid; width: 200px; grid-template-columns: 1fr 1fr 1fr;"
    >
      <Toggle
        icon="bold"
        location="LEFT"
        label="Bold"
        value={font === "bold"}
        on:click={() => {
          font = "bold";
        }}
      />
      <Toggle
        icon="italic"
        location="CENTER"
        label="Italic"
        value={font === "italic"}
        on:click={() => {
          font = "italic";
        }}
      />
      <Toggle
        icon="small-caps"
        location="RIGHT"
        label="Small Caps"
        value={font === "small-caps"}
        on:click={() => {
          font = "small-caps";
        }}
      />
    </div>
  </Base>
  <svelte:fragment slot="controls">
    <Hst.Checkbox bind:value title="value" />
    <Hst.Radio bind:value={icon} title="icon" options={icons} />
  </svelte:fragment>
</Hst.Story>
