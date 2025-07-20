<script lang="ts">
  import type { Icon } from "../icons";
  import Panel from "../Panel/Panel.svelte";
  import Toggle from "./Toggle.svelte";

  let value = $state(false);
  let icon: Icon = $state("copy");
  let fontStyle: "bold" | "italic" | "small-caps" = $state("bold");
</script>

<div style="display: flex; flex-direction: column; gap: 2px">
  <Panel title="With value, Without value and transparent">
    <Toggle {icon} bind:value />
    <Toggle {icon} />
    <Toggle {icon} transparent />
  </Panel>
  <Panel title="Toggles in a group">
    <div style="display:inline-flex; gap: 1px">
      <Toggle icon="chevron-left" rounded="left" />
      <Toggle icon="eye-opened" bind:value rounded="none" />
      <Toggle icon="chevron-right" rounded="right" />
    </div>
  </Panel>
  <Panel title="Font styles">
    <div class="font-styles">
      <Toggle
        icon="bold"
        rounded="left"
        label="Bold"
        value={fontStyle === "bold"}
        onclick={() => {
          fontStyle = "bold";
        }}
      />
      <Toggle
        icon="italic"
        rounded="none"
        label="Italic"
        value={fontStyle === "italic"}
        onclick={() => {
          fontStyle = "italic";
        }}
      />
      <Toggle
        icon="small-caps"
        rounded="right"
        label="Small Caps"
        value={fontStyle === "small-caps"}
        onclick={() => {
          fontStyle = "small-caps";
        }}
      />
    </div>
  </Panel>
</div>

<style>
  .font-styles {
    display: grid;
    grid-template-columns: repeat(3, minmax(min-content, 1fr));
    gap: 1px;

    width: 220px;
    max-width: 100%;
  }
</style>
