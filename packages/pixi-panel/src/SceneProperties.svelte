<script lang="ts">
  import Checkbox from "blender-elements/src/Checkbox/Checkbox.svelte";
  import NumberField from "blender-elements/src/NumberField/NumberField.svelte";
  import Panel from "blender-elements/src/Panel/Panel.svelte";
  import Property from "blender-elements/src/Property/Property.svelte";
  import Box from "blender-elements/src/Box/Box.svelte";
  import type { NodeProperties } from "./types";

  type Props = {
    props: NodeProperties;
    expanded: Record<string, boolean>;
    onchange: (change: { property: string; value: number | boolean }) => void;
  };

  let { props, expanded = $bindable(), onchange }: Props = $props();

  let tickerPanel = $derived(typeof props.speed === "number");
</script>

{#if tickerPanel}
  <Panel title="Ticker" bind:expanded={expanded.ticker}>
    <Box gap={6} padding={8}>
      {#if typeof props.speed === "number"}
        <Property label="Speed" hint="Factor of current deltaTime">
          <NumberField
            value={props.speed}
            step={0.01}
            setValue={(value) => onchange({ property: "speed", value })}
          />
        </Property>
      {/if}
      {#if typeof props.started === "boolean"}
        <Property>
          <Checkbox
            value={props.started}
            hint="Whether or not this ticker has been started"
            setValue={(value) => onchange({ property: "started", value })}
          >
            Started
          </Checkbox>
        </Property>
      {/if}
    </Box>
  </Panel>
{/if}
