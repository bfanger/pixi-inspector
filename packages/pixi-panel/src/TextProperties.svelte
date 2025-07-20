<script lang="ts">
  import Checkbox from "blender-elements/src/Checkbox/Checkbox.svelte";
  import NumberField from "blender-elements/src/NumberField/NumberField.svelte";
  import Panel from "blender-elements/src/Panel/Panel.svelte";
  import Property from "blender-elements/src/Property/Property.svelte";
  import SelectMenu from "blender-elements/src/SelectMenu/SelectMenu.svelte";
  import TextField from "blender-elements/src/TextField/TextField.svelte";
  import Toggle from "blender-elements/src/Toggle/Toggle.svelte";
  import type { NodeProperties } from "./types";
  import PropertyGroups from "../../blender-elements/src/Property/PropertyGroups.svelte";

  type Props = {
    props: NodeProperties;
    expanded: Record<string, boolean>;
    onchange: (e: { property: string; value: any }) => void;
  };

  let { props, expanded = $bindable(), onchange }: Props = $props();

  let fontPanel = $derived(
    typeof props.fontFamily === "string" ||
      typeof props.fontSize === "number" ||
      typeof props.fontStyle === "string" ||
      typeof props.fontVariant === "string",
  );
  let alignmentPanel = $derived(
    typeof props.align === "string" || typeof props.textBaseline === "string",
  );
  let spacingPanel = $derived(typeof props.letterSpacing === "number");
  let dropShadowPanel = $derived(typeof props.dropShadow === "boolean");
  let strokePanel = $derived(typeof props.stroke === "string");

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
      oninput={(value) => onchange({ property: "text", value })}
    />
  </div>
{/if}

{#if fontPanel}
  <Panel title="Font" bind:expanded={expanded.font}>
    <PropertyGroups>
      {#if typeof props.fontFamily === "string"}
        <Property
          label="Family"
          hint="The font family, can be a single font name, or a list of names where the first is the preferred font."
        >
          <TextField
            value={props.fontFamily}
            setValue={(value) => onchange({ property: "fontFamily", value })}
          />
        </Property>
      {/if}
      {#if typeof props.fontSize === "number"}
        <Property label="Size" hint="The font size">
          <NumberField
            value={props.fontSize}
            min={0}
            step={1}
            setValue={(value) => onchange({ property: "fontSize", value })}
          />
        </Property>
      {/if}
      {#if typeof props.fontStyle === "string"}
        <Property label="Style" hint="The font style">
          <div class="three-columns">
            <Toggle
              label="Normal"
              value={props.fontStyle === "normal"}
              rounded="left"
              setValue={() =>
                onchange({ property: "fontStyle", value: "normal" })}
            />
            <Toggle
              icon="italic"
              label="Italic"
              value={props.fontStyle === "italic"}
              rounded="none"
              setValue={() =>
                onchange({ property: "fontStyle", value: "italic" })}
            />
            <Toggle
              label="Oblique"
              value={props.fontStyle === "oblique"}
              rounded="right"
              setValue={() =>
                onchange({ property: "fontStyle", value: "oblique" })}
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
              rounded="left"
              setValue={() =>
                onchange({ property: "fontVariant", value: "normal" })}
            />

            <Toggle
              icon="small-caps"
              label="Small Caps"
              value={props.fontVariant === "small-caps"}
              rounded="right"
              setValue={() =>
                onchange({
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
            setValue={(value) => onchange({ property: "fontWeight", value })}
          />
        </Property>
      {/if}
    </PropertyGroups>
  </Panel>
{/if}

{#if alignmentPanel}
  <Panel title="Alignment" bind:expanded={expanded.alignment}>
    <PropertyGroups>
      {#if typeof props.align === "string"}
        <Property
          label="Align"
          hint="Alignment for multiline text, does not affect single line text"
        >
          <SelectMenu
            value={props.align}
            options={alignOptions}
            setValue={(value) => onchange({ property: "align", value })}
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
            setValue={(value) => onchange({ property: "textBaseline", value })}
          />
        </Property>
      {/if}
    </PropertyGroups>
  </Panel>
{/if}

{#if spacingPanel}
  <Panel title="Spacing" bind:expanded={expanded.spacing}>
    <PropertyGroups>
      {#if typeof props.leading === "number"}
        <Property label="Leading" hint="The space between lines">
          <NumberField
            value={props.leading}
            min={0}
            step={0.1}
            setValue={(value) => onchange({ property: "leading", value })}
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
            setValue={(value) =>
              onchange({
                property: "letterSpacing",
                value,
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
            setValue={(value) => onchange({ property: "lineHeight", value })}
          />
        </Property>
      {/if}
      {#if typeof props.padding === "number"}
        <Property label="Padding">
          <NumberField
            value={props.padding}
            min={0}
            step={1}
            setValue={(value) => onchange({ property: "padding", value })}
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
              rounded="left"
              setValue={() =>
                onchange({ property: "whiteSpace", value: "normal" })}
            />
            <Toggle
              label="Pre"
              value={props.whiteSpace === "pre"}
              rounded="none"
              setValue={() =>
                onchange({ property: "whiteSpace", value: "pre" })}
            />
            <Toggle
              label="Pre Line"
              value={props.whiteSpace === "pre-line"}
              rounded="right"
              setValue={() =>
                onchange({ property: "whiteSpace", value: "pre-line" })}
            />
          </div>
        </Property>
      {/if}
      {#if typeof props.trim === "boolean"}
        <Property>
          <Checkbox
            value={props.trim}
            hint="Trim transparent borders"
            setValue={(value) => onchange({ property: "trim", value })}
          >
            Trim
          </Checkbox>
        </Property>
      {/if}
    </PropertyGroups>
  </Panel>
{/if}

{#if typeof props.wordWrap === "boolean"}
  <Panel
    title="Word wrap"
    value={props.wordWrap}
    bind:expanded={expanded.wordWrap}
    setValue={(value) => onchange({ property: "wordWrap", value })}
  >
    <PropertyGroups>
      {#if typeof props.wordWrapWidth === "number"}
        <Property
          label="Width"
          hint="The width at which text will wrap, it needs wordWrap to be set to true"
        >
          <NumberField
            value={props.wordWrapWidth}
            min={0}
            step={1}
            setValue={(value) =>
              onchange({
                property: "wordWrapWidth",
                value,
              })}
          />
        </Property>
      {/if}
      {#if typeof props.breakWords === "boolean"}
        <Property>
          <Checkbox
            value={props.breakWords}
            hint="Indicates if lines can be wrapped within words, it needs wordWrap to be set to true."
            setValue={(value) => onchange({ property: "breakWords", value })}
          >
            Break words
          </Checkbox>
        </Property>
      {/if}
    </PropertyGroups>
  </Panel>
{/if}

{#if dropShadowPanel}
  <Panel
    title="Drop shadow"
    value={props.dropShadow}
    bind:expanded={expanded.dropShadow}
    setValue={(value) => onchange({ property: "dropShadow", value })}
  >
    <PropertyGroups>
      {#if typeof props.dropShadowAlpha === "number"}
        <Property label="Alpha" hint="Set alpha for the drop shadow">
          <NumberField
            value={props.dropShadowAlpha}
            step={0.01}
            min={0}
            max={1}
            setValue={(value) =>
              onchange({
                property: "dropShadowAlpha",
                value,
              })}
          />
        </Property>
      {/if}
      {#if typeof props.dropShadowColor === "string"}
        <Property
          label="Color"
          hint="A fill style to be used on the dropshadow"
        >
          <TextField
            value={props.dropShadowColor}
            setValue={(value) =>
              onchange({
                property: "dropShadowColor",
                value,
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
            setValue={(value) =>
              onchange({
                property: "dropShadowAngle",
                value,
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
            setValue={(value) =>
              onchange({
                property: "dropShadowBlur",
                value,
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
            setValue={(value) =>
              onchange({
                property: "dropShadowDistance",
                value,
              })}
          />
        </Property>
      {/if}
    </PropertyGroups>
  </Panel>
{/if}

{#if strokePanel}
  <Panel title="Stroke" bind:expanded={expanded.stroke}>
    <PropertyGroups>
      {#if typeof props.stroke === "string"}
        <Property
          label="Stroke"
          hint="A canvas fillstyle that will be used on the text stroke"
        >
          <TextField
            value={props.stroke}
            setValue={(value) =>
              onchange({
                property: "stroke",
                value,
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
            setValue={(value) =>
              onchange({
                property: "strokeThickness",
                value,
              })}
          />
        </Property>
      {/if}
    </PropertyGroups>
  </Panel>
{/if}

<!-- 
    lineJoin: string
    miterLimit: number
-->

<style>
  .text {
    display: flex;
    align-items: center;
    padding-top: 8px;
    padding-bottom: 8px;

    & .label {
      flex-shrink: 0;
      margin-right: 8px;
    }
  }

  .two-columns {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1px;
  }

  .three-columns {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 1px;
  }
</style>
