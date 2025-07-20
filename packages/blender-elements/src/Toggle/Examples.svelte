<script lang="ts">
  import type { Icon } from "../icons";
  import Toggle from "./Toggle.svelte";

  let value = $state(false);
  let icon: Icon = $state("copy");
  let fontStyle: "bold" | "italic" | "small-caps" = $state("bold");
</script>

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
  style="display: grid; grid-template-columns: repeat(3, minmax(min-content,1fr)); width: 220px;max-width: 100%"
>
  <Toggle
    icon="bold"
    location="left"
    label="Bold"
    value={fontStyle === "bold"}
    onclick={() => {
      fontStyle = "bold";
    }}
  />
  <Toggle
    icon="italic"
    location="center"
    label="Italic"
    value={fontStyle === "italic"}
    onclick={() => {
      fontStyle = "italic";
    }}
  />
  <Toggle
    icon="small-caps"
    location="right"
    label="Small Caps"
    value={fontStyle === "small-caps"}
    onclick={() => {
      fontStyle = "small-caps";
    }}
  />
</div>
