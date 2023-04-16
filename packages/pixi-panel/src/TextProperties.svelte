<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import type { NodeProperties } from "./types";
  import Panel from "blender-elements/src/Panel/Panel.svelte";
  import NumberField from "blender-elements/src/NumberField/NumberField.svelte";
  import Checkbox from "blender-elements/src/Checkbox/Checkbox.svelte";
  import Property from "blender-elements/src/Property/Property.svelte";
  import TextField from "blender-elements/src/TextField/TextField.svelte";
  import Toggle from "blender-elements/src/Toggle/Toggle.svelte";
  import SelectMenu from "blender-elements/src/SelectMenu/SelectMenu.svelte";

  export let props: NodeProperties;
  export let expanded: Record<string, boolean>;

  const dispatch = createEventDispatcher();

  $: fontPanel =
    typeof props.fontFamily === "string" ||
    typeof props.fontSize === "number" ||
    typeof props.fontStyle === "string" ||
    typeof props.fontVariant === "string";
  $: alignmentPanel =
    typeof props.align === "string" || typeof props.textBaseline === "string";
  $: spacingPanel = typeof props.letterSpacing === "number";
  $: dropShadowPanel = typeof props.dropShadow === "boolean";
  $: strokePanel = typeof props.stroke === "string";

  const alignOptions = [
    { value: "left", label: "Left", icon: "text-left" },
    { value: "center", label: "Center", icon: "text-center" },
    { value: "right", label: "Right", icon: "text-right" },
    { value: "justify", label: "Justify", icon: "text-justify" },
  ];
</script>

{#if typeof props.text === "string"}
  <div class="text">
    <label
      class="label"
      for="text"
      title="Use shift-enter to create a multiline string">Text</label
    >
    <TextField
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
      <Property
        label="Family"
        hint="The font family, can be a single font name, or a list of names where the first is the preferred font."
      >
        <TextField
          value={props.fontFamily}
          on:change={(e) =>
            dispatch("change", { property: "fontFamily", value: e.detail })}
        />
      </Property>
    {/if}
    {#if typeof props.fontSize === "number"}
      <Property label="Size" hint="The font size">
        <NumberField
          value={props.fontSize}
          min={0}
          step={1}
          on:change={(e) =>
            dispatch("change", { property: "fontSize", value: e.detail })}
        />
      </Property>
    {/if}
    {#if typeof props.fontStyle === "string"}
      <Property label="Style" hint="The font style">
        <div class="three-columns">
          <Toggle
            label="Normal"
            value={props.fontStyle === "normal"}
            location="LEFT"
            on:change={() =>
              dispatch("change", { property: "fontStyle", value: "normal" })}
          />
          <Toggle
            icon="italic"
            label="Italic"
            value={props.fontStyle === "italic"}
            location="CENTER"
            on:change={() =>
              dispatch("change", { property: "fontStyle", value: "italic" })}
          />
          <Toggle
            label="Oblique"
            value={props.fontStyle === "oblique"}
            location="RIGHT"
            on:change={() =>
              dispatch("change", { property: "fontStyle", value: "oblique" })}
          />
        </div>
      </Property>
    {/if}
    {#if typeof props.fontVariant === "string"}
      <Property label="Variant" hint="The font variant">
        <div class="two-columns">
          <Toggle
            label="Normal"
            value={props.fontVariant === "normal"}
            location="LEFT"
            on:change={() =>
              dispatch("change", { property: "fontVariant", value: "normal" })}
          />

          <Toggle
            icon="small-caps"
            label="Small Caps"
            value={props.fontVariant === "small-caps"}
            location="RIGHT"
            on:change={() =>
              dispatch("change", {
                property: "fontVariant",
                value: "small-caps",
              })}
          />
        </div>
      </Property>
    {/if}
    {#if typeof props.fontWeight === "string"}
      <Property label="Weight" hint="The font weight">
        <SelectMenu
          value={props.fontWeight}
          options={[
            "normal",
            "bold",
            "bolder",
            "lighter",
            "100",
            "200",
            "300",
            "400",
            "500",
            "600",
            "700",
            "800",
            "900",
          ]}
          on:change={(e) =>
            dispatch("change", { property: "fontWeight", value: e.detail })}
        />
      </Property>
    {/if}
  </Panel>
{/if}
{#if alignmentPanel}
  <Panel title="Alignment" bind:expanded={expanded.alignment}>
    {#if typeof props.align === "string"}
      <Property
        label="Align"
        hint="Alignment for multiline text, does not affect single line text"
      >
        <SelectMenu
          value={props.align}
          options={alignOptions}
          on:change={(e) =>
            dispatch("change", { property: "align", value: e.detail })}
        />
      </Property>
    {/if}
    {#if typeof props.textBaseline === "string"}
      <Property
        label="Baseline"
        hint="The baseline of the text that is rendered."
      >
        <SelectMenu
          value={props.textBaseline}
          options={[
            "alphabetic",
            "top",
            "hanging",
            "middle",
            "ideographic",
            "bottom",
          ]}
          on:change={(e) =>
            dispatch("change", { property: "textBaseline", value: e.detail })}
        />
      </Property>
    {/if}
  </Panel>
{/if}
{#if spacingPanel}
  <Panel title="Spacing" bind:expanded={expanded.spacing}>
    {#if typeof props.leading === "number"}
      <Property label="Leading" hint="The space between lines">
        <NumberField
          value={props.leading}
          min={0}
          step={0.1}
          on:change={(e) =>
            dispatch("change", { property: "leading", value: e.detail })}
        />
      </Property>
    {/if}
    {#if typeof props.letterSpacing === "number"}
      <Property
        label="Letter spacing"
        hint="The amount of spacing between letters"
      >
        <NumberField
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
      <Property
        label="Line height"
        hint="The line height, a number that represents the vertical space that a letter uses"
      >
        <NumberField
          value={props.lineHeight}
          step={1}
          on:change={(e) =>
            dispatch("change", { property: "lineHeight", value: e.detail })}
        />
      </Property>
    {/if}
    {#if typeof props.padding === "number"}
      <Property label="Padding">
        <NumberField
          value={props.padding}
          min={0}
          step={1}
          on:change={(e) =>
            dispatch("change", { property: "padding", value: e.detail })}
        />
      </Property>
    {/if}
    {#if typeof props.whiteSpace === "string"}
      <Property
        label="White Space"
        hint="Determines whether newlines & spaces are collapsed or preserved"
      >
        <div class="three-columns">
          <Toggle
            label="Normal"
            value={props.whiteSpace === "normal"}
            location="LEFT"
            on:change={() =>
              dispatch("change", { property: "whiteSpace", value: "normal" })}
          />
          <Toggle
            label="Pre"
            value={props.whiteSpace === "pre"}
            location="CENTER"
            on:change={() =>
              dispatch("change", { property: "whiteSpace", value: "pre" })}
          />
          <Toggle
            label="Pre Line"
            value={props.whiteSpace === "pre-line"}
            location="RIGHT"
            on:change={() =>
              dispatch("change", { property: "whiteSpace", value: "pre-line" })}
          />
        </div>
      </Property>
    {/if}
    {#if typeof props.trim === "boolean"}
      <Property>
        <Checkbox
          value={props.trim}
          hint="Trim transparent borders"
          on:change={(e) =>
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
      <Property
        label="Width"
        hint="The width at which text will wrap, it needs wordWrap to be set to true"
      >
        <NumberField
          value={props.wordWrapWidth}
          min={0}
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
          hint="Indicates if lines can be wrapped within words, it needs wordWrap to be set to true."
          on:change={(e) =>
            dispatch("change", { property: "breakWords", value: e.detail })}
        >
          Break words
        </Checkbox>
      </Property>
    {/if}
  </Panel>
{/if}

{#if dropShadowPanel}
  <Panel
    title="Drop shadow"
    value={props.dropShadow}
    bind:expanded={expanded.dropShadow}
    on:change={(e) =>
      dispatch("change", { property: "dropShadow", value: e.detail })}
  >
    {#if typeof props.dropShadowAlpha === "number"}
      <Property label="Alpha" hint="Set alpha for the drop shadow">
        <NumberField
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
      <Property label="Color" hint="A fill style to be used on the dropshadow">
        <TextField
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
      <Property label="Angle" hint="Set a angle of the drop shadow">
        <NumberField
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
      <Property label="Blur" hint="Set a shadow blur radius">
        <NumberField
          value={props.dropShadowBlur}
          min={0}
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
      <Property label="Distance" hint="Set a distance of the drop shadow">
        <NumberField
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
      <Property
        label="Stroke"
        hint="A canvas fillstyle that will be used on the text stroke"
      >
        <TextField
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
      <Property
        label="Thickness"
        hint="A number that represents the thickness of the stroke"
      >
        <NumberField
          value={props.strokeThickness}
          min={0}
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
    lineJoin: string
    miterLimit: number
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
  .two-columns {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
  .three-columns {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
  }
</style>
