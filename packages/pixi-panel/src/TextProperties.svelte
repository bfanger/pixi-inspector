<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import type { NodeProperties } from "./types";
  import Panel from "blender-elements/src/Panel/Panel.svelte";
  import NumberInput from "blender-elements/src/NumberInput/NumberInput.svelte";
  import Checkbox from "blender-elements/src/Checkbox/Checkbox.svelte";
  import Property from "blender-elements/src/Property/Property.svelte";
  import TextInput from "blender-elements/src/TextInput/TextInput.svelte";

  export let props: NodeProperties;
  export let expanded: Record<string, boolean>;

  const dispatch = createEventDispatcher();

  $: fontPanel = typeof props.fontSize === "number";
  $: spacingPanel = typeof props.letterSpacing === "number";
  $: dropShadowPanel = typeof props.dropShadow === "boolean";
  $: strokePanel = typeof props.stroke === "string";
</script>

{#if typeof props.text === "string"}
  <div class="text">
    <label class="label" for="text">Text</label>
    <TextInput
      id="text"
      value={props.text}
      on:input={(e) =>
        dispatch("change", { property: "text", value: e.detail })}
    />
  </div>
{/if}
{#if fontPanel}
  <Panel title="Font" bind:expanded={expanded.font}>
    {#if typeof props.fontFamily === "string"}
      <Property label="Family">
        <TextInput
          value={props.fontFamily}
          on:change={(e) =>
            dispatch("change", { property: "fontFamily", value: e.detail })}
        />
      </Property>
    {/if}
    {#if typeof props.fontSize === "number"}
      <Property label="Size">
        <NumberInput
          value={props.fontSize}
          step={1}
          on:change={(e) =>
            dispatch("change", { property: "fontSize", value: e.detail })}
        />
      </Property>
    {/if}
    <!-- 
      fontStyle", "string"));
      fontVariant", "string"));
      fontWeight", "string"));
       -->
  </Panel>
{/if}
{#if spacingPanel}
  <Panel title="Spacing" bind:expanded={expanded.spacing}>
    {#if typeof props.leading === "number"}
      <Property label="Leading">
        <NumberInput
          value={props.leading}
          step={0.1}
          on:change={(e) =>
            dispatch("change", { property: "leading", value: e.detail })}
        />
      </Property>
    {/if}
    {#if typeof props.letterSpacing === "number"}
      <Property label="Letter spacing">
        <NumberInput
          value={props.letterSpacing}
          step={0.1}
          on:change={(e) =>
            dispatch("change", {
              property: "letterSpacing",
              value: e.detail,
            })}
        />
      </Property>
    {/if}

    {#if typeof props.lineHeight === "number"}
      <Property label="Line height">
        <NumberInput
          value={props.lineHeight}
          step={0.1}
          on:change={(e) =>
            dispatch("change", { property: "lineHeight", value: e.detail })}
        />
      </Property>
    {/if}
    {#if typeof props.padding === "number"}
      <Property label="Padding">
        <NumberInput
          value={props.padding}
          step={0.1}
          on:change={(e) =>
            dispatch("change", { property: "padding", value: e.detail })}
        />
      </Property>
    {/if}

    {#if typeof props.trim === "boolean"}
      <Property>
        <Checkbox
          value={props.trim}
          on:toggle={(e) =>
            dispatch("change", { property: "trim", value: e.detail })}
        >
          Trim
        </Checkbox>
      </Property>
    {/if}
  </Panel>
{/if}
{#if typeof props.wordWrap === "boolean"}
  <Panel
    title="Word wrap"
    value={props.wordWrap}
    bind:expanded={expanded.wordWrap}
    on:change={(e) =>
      dispatch("change", { property: "wordWrap", value: e.detail })}
  >
    {#if typeof props.wordWrapWidth === "number"}
      <Property label="Width">
        <NumberInput
          value={props.wordWrapWidth}
          step={1}
          on:change={(e) =>
            dispatch("change", {
              property: "wordWrapWidth",
              value: e.detail,
            })}
        />
      </Property>
    {/if}
    {#if typeof props.breakWords === "boolean"}
      <Property>
        <Checkbox
          value={props.breakWords}
          on:toggle={(e) =>
            dispatch("change", { property: "breakWords", value: e.detail })}
        >
          Break words
        </Checkbox>
      </Property>
    {/if}
  </Panel>
{/if}

{#if typeof props.dropShadow === "boolean"}
  <Panel
    title="Drop shadow"
    value={props.dropShadow}
    bind:expanded={expanded.dropShadow}
    on:change={(e) =>
      dispatch("change", { property: "dropShadow", value: e.detail })}
  >
    {#if typeof props.dropShadowAlpha === "number"}
      <Property label="Alpha">
        <NumberInput
          value={props.dropShadowAlpha}
          step={0.01}
          min={0}
          max={1}
          on:change={(e) =>
            dispatch("change", {
              property: "dropShadowAlpha",
              value: e.detail,
            })}
        />
      </Property>
    {/if}
    {#if typeof props.dropShadowColor === "string"}
      <Property label="Color">
        <TextInput
          value={props.dropShadowColor}
          on:change={(e) =>
            dispatch("change", {
              property: "dropShadowColor",
              value: e.detail,
            })}
        />
      </Property>
    {/if}
    {#if typeof props.dropShadowAngle === "number"}
      <Property label="Angle">
        <NumberInput
          value={props.dropShadowAngle}
          step={0.01}
          suffix="r"
          on:change={(e) =>
            dispatch("change", {
              property: "dropShadowAngle",
              value: e.detail,
            })}
        />
      </Property>
    {/if}
    {#if typeof props.dropShadowBlur === "number"}
      <Property label="Blur">
        <NumberInput
          value={props.dropShadowBlur}
          step={0.1}
          on:change={(e) =>
            dispatch("change", {
              property: "dropShadowBlur",
              value: e.detail,
            })}
        />
      </Property>
    {/if}
    {#if typeof props.dropShadowDistance === "number"}
      <Property label="Distance">
        <NumberInput
          value={props.dropShadowDistance}
          step={0.1}
          min={0}
          on:change={(e) =>
            dispatch("change", {
              property: "dropShadowDistance",
              value: e.detail,
            })}
        />
      </Property>
    {/if}
  </Panel>
{/if}

{#if strokePanel}
  <Panel title="Stroke" bind:expanded={expanded.stroke}>
    {#if typeof props.stroke === "string"}
      <Property label="Stroke">
        <TextInput
          value={props.stroke}
          on:change={(e) =>
            dispatch("change", {
              property: "stroke",
              value: e.detail,
            })}
        />
      </Property>
    {/if}
    {#if typeof props.strokeThickness === "number"}
      <Property label="Thickness">
        <NumberInput
          value={props.strokeThickness}
          step={0.1}
          on:change={(e) =>
            dispatch("change", {
              property: "strokeThickness",
              value: e.detail,
            })}
        />
      </Property>
    {/if}
  </Panel>
{/if}

<!-- 
    align: string
    lineJoin: string
    miterLimit: number
    textBaseline: string
    whiteSpace: string
-->

<style lang="scss">
  .text {
    padding-top: 8px;
    padding-bottom: 8px;
    display: flex;
    align-items: center;

    .label {
      flex-shrink: 0;
      margin-right: 8px;
    }
  }
</style>
