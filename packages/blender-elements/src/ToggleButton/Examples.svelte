<script lang="ts">
  import type { Icon } from "../icons";
  import Panel from "../Panel/Panel.svelte";
  import ToggleButton from "./ToggleButton.svelte";

  let value = $state(false);
  let icon: Icon = $state("copy");
  let fontStyle: "bold" | "italic" | "small-caps" = $state("bold");
</script>

<div style="display: flex; flex-direction: column; gap: 2px">
  <Panel title="With value, Without value and transparent">
    <ToggleButton {icon} bind:value />
    <ToggleButton {icon} />
    <ToggleButton {icon} transparent />
  </Panel>
  <Panel title="Toggles in a group">
    <div style="display: inline-flex">
      <ToggleButton icon="chevron-left" rounded="left" />
      <ToggleButton icon="eye-opened" bind:value rounded="none" />
      <ToggleButton icon="chevron-right" rounded="right" />
    </div>
  </Panel>
  <Panel title="Font styles">
    <div class="font-styles">
      <ToggleButton
        icon="bold"
        rounded="left"
        label="Bold"
        value={fontStyle === "bold"}
        onclick={() => {
          fontStyle = "bold";
        }}
      />
      <ToggleButton
        icon="italic"
        rounded="none"
        label="Italic"
        value={fontStyle === "italic"}
        onclick={() => {
          fontStyle = "italic";
        }}
      />
      <ToggleButton
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
    width: 220px;
    max-width: 100%;
  }
</style>
