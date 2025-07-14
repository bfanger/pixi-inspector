<script lang="ts">
  import Base from "../Base.svelte";
  import { type Icon, icons } from "../icons";
  import Toggle from "./Toggle.svelte";

  type Props = {
    Hst: any;
  };

  let { Hst }: Props = $props();

  let value = $state(false);
  let icon: Icon = $state("copy");
  let font: "bold" | "italic" | "small-caps" = $state("bold");
</script>

<Hst.Story>
  <Base>
    <Toggle {icon} bind:value />
    <Toggle {icon} />
    <Toggle {icon} transparent />
    <br />
    <div style="display:inline-flex">
      <Toggle icon="chevron-left" location="left" />
      <Toggle icon="eye-opened" bind:value location="center" />
      <Toggle icon="chevron-right" location="right" />
    </div>

    <div
      style="display: grid; width: 200px; grid-template-columns: 1fr 1fr 1fr;"
    >
      <Toggle
        icon="bold"
        location="left"
        label="Bold"
        value={font === "bold"}
        onclick={() => {
          font = "bold";
        }}
      />
      <Toggle
        icon="italic"
        location="center"
        label="Italic"
        value={font === "italic"}
        onclick={() => {
          font = "italic";
        }}
      />
      <Toggle
        icon="small-caps"
        location="right"
        label="Small Caps"
        value={font === "small-caps"}
        onclick={() => {
          font = "small-caps";
        }}
      />
    </div>
  </Base>
  {#snippet controls()}
    <Hst.Checkbox bind:value title="value" />
    <Hst.Radio bind:value={icon} title="icon" options={icons} />
  {/snippet}
</Hst.Story>
