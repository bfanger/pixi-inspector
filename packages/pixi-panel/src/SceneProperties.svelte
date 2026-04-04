<script lang="ts">
  import CheckboxInput from "blender-elements/src/CheckboxInput/CheckboxInput.svelte";
  import NumberInput from "blender-elements/src/NumberInput/NumberInput.svelte";
  import Panel from "blender-elements/src/Panel/Panel.svelte";
  import Property from "blender-elements/src/Property/Property.svelte";
  import Box from "blender-elements/src/Box/Box.svelte";
  import type { NodeProperties } from "./types";
  import ColorInput from "../../blender-elements/src/ColorInput/ColorInput.svelte";

  type Props = {
    value: NodeProperties;
    expanded: Record<string, boolean>;
    setValue: (update: { property: string; value: any }) => void;
    setExpanded?: (section: string, expanded: boolean) => void;
  };

  let { value, expanded, setValue, setExpanded }: Props = $props();

  let tickerPanel = $derived(typeof value.speed === "number");
</script>

{#if tickerPanel}
  <Panel
    title="Ticker"
    expanded={expanded.ticker}
    setExpanded={(val) => setExpanded?.("ticker", val)}
  >
    <Box gap={6} padding={8}>
      {#if typeof value.speed === "number"}
        <Property label="Speed" hint="Factor of current deltaTime">
          <NumberInput
            value={value.speed}
            step={0.01}
            setValue={(value) => setValue({ property: "speed", value })}
          />
        </Property>
      {/if}
      {#if typeof value.started === "boolean"}
        <Property>
          <CheckboxInput
            value={value.started}
            hint="Whether or not this ticker has been started"
            setValue={(value) => setValue({ property: "started", value })}
          >
            Started
          </CheckboxInput>
        </Property>
      {/if}
    </Box>
  </Panel>
{/if}

{#if value.background !== undefined}
  <Panel
    title="Renderer"
    expanded={expanded.renderer}
    setExpanded={(value) => setExpanded?.("renderer", value)}
  >
    <Box gap={6} padding={8}>
      {#if typeof value.speed === "number"}
        <Property
          label="Background"
          hint="The background color and alpha of the main view."
        >
          <ColorInput
            value={value.background}
            setValue={(value) => setValue({ property: "background", value })}
          />
        </Property>
      {/if}
    </Box>
  </Panel>
{/if}
