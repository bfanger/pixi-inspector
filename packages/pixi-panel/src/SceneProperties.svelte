<script lang="ts">
  import Panel from "blender-elements/src/Panel/Panel.svelte";
  import type { NodeProperties } from "./types";
  import { createEventDispatcher } from "svelte";
  import NumberInput from "blender-elements/src/NumberInput/NumberInput.svelte";
  import Checkbox from "blender-elements/src/Checkbox/Checkbox.svelte";
  import Property from "blender-elements/src/Property/Property.svelte";

  export let props: NodeProperties;
  export let expanded: Record<string, boolean>;

  const dispatch = createEventDispatcher();

  $: tickerPanel = typeof props.speed === "number";
</script>

{#if tickerPanel}
  <Panel title="Ticker" bind:expanded={expanded.ticker}>
    {#if typeof props.speed === "number"}
      <Property label="Speed" hint="Factor of current deltaTime">
        <NumberInput
          value={props.speed}
          step={0.01}
          on:change={(e) =>
            dispatch("change", { property: "speed", value: e.detail })}
        />
      </Property>
    {/if}
    {#if typeof props.started === "boolean"}
      <Property>
        <Checkbox
          value={props.started}
          hint="Whether or not this ticker has been started"
          on:change={(e) =>
            dispatch("change", { property: "started", value: e.detail })}
        >
          Started
        </Checkbox>
      </Property>
    {/if}
  </Panel>
{/if}
