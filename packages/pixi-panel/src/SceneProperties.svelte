<script lang="ts">
  import CheckboxInput from "blender-elements/src/CheckboxInput/CheckboxInput.svelte";
  import NumberInput from "blender-elements/src/NumberInput/NumberInput.svelte";
  import Panel from "blender-elements/src/Panel/Panel.svelte";
  import Property from "blender-elements/src/Property/Property.svelte";
  import Box from "blender-elements/src/Box/Box.svelte";
  import type { NodeProperties } from "./types";
  import ColorInput from "../../blender-elements/src/ColorInput/ColorInput.svelte";

  type Props = {
    props: NodeProperties;
    expanded: Record<string, boolean>;
    onchange: (change: {
      property: string;
      value: number | boolean | string;
    }) => void;
  };

  let { props, expanded = $bindable(), onchange }: Props = $props();

  let tickerPanel = $derived(typeof props.speed === "number");
</script>

{#if tickerPanel}
  <Panel title="Ticker" bind:expanded={expanded.ticker}>
    <Box gap={6} padding={8}>
      {#if typeof props.speed === "number"}
        <Property label="Speed" hint="Factor of current deltaTime">
          <NumberInput
            value={props.speed}
            step={0.01}
            setValue={(value) => onchange({ property: "speed", value })}
          />
        </Property>
      {/if}
      {#if typeof props.started === "boolean"}
        <Property>
          <CheckboxInput
            value={props.started}
            hint="Whether or not this ticker has been started"
            setValue={(value) => onchange({ property: "started", value })}
          >
            Started
          </CheckboxInput>
        </Property>
      {/if}
    </Box>
  </Panel>
{/if}

{#if props.background !== undefined}
  <Panel title="Renderer" bind:expanded={expanded.renderer}>
    <Box gap={6} padding={8}>
      {#if typeof props.speed === "number"}
        <Property
          label="Background"
          hint="The background color and alpha of the main view."
        >
          <ColorInput
            value={props.background}
            setValue={(value) => onchange({ property: "background", value })}
          />
        </Property>
      {/if}
    </Box>
  </Panel>
{/if}
