<script lang="ts">
  import CheckboxInput from "blender-elements/src/CheckboxInput/CheckboxInput.svelte";
  import NumberInput from "blender-elements/src/NumberInput/NumberInput.svelte";
  import Panel from "blender-elements/src/Panel/Panel.svelte";
  import Property from "blender-elements/src/Property/Property.svelte";
  import SelectMenu from "blender-elements/src/SelectMenu/SelectMenu.svelte";
  import TextInput from "blender-elements/src/TextInput/TextInput.svelte";
  import ToggleButton from "blender-elements/src/ToggleButton/ToggleButton.svelte";
  import Box from "blender-elements/src/Box/Box.svelte";
  import Grid from "blender-elements/src/Grid/Grid.svelte";
  import type { NodeProperties } from "./types";

  type Props = {
    value: NodeProperties;
    expanded: Record<string, boolean>;
    setValue: (update: { property: string; value: any }) => void;
    setExpanded?: (section: string, expanded: boolean) => void;
  };

  let { value, expanded, setValue: onchange, setExpanded }: Props = $props();

  let fontPanel = $derived(
    typeof value.fontFamily === "string" ||
      typeof value.fontSize === "number" ||
      typeof value.fontStyle === "string" ||
      typeof value.fontVariant === "string",
  );
  let alignmentPanel = $derived(
    typeof value.align === "string" || typeof value.textBaseline === "string",
  );
  let spacingPanel = $derived(typeof value.letterSpacing === "number");
  let dropShadowPanel = $derived(typeof value.dropShadow === "boolean");
  let strokePanel = $derived(typeof value.stroke === "string");

  const alignOptions = [
    { value: "left", label: "Left", icon: "text-left" },
    { value: "center", label: "Center", icon: "text-center" },
    { value: "right", label: "Right", icon: "text-right" },
    { value: "justify", label: "Justify", icon: "text-justify" },
  ];
</script>

{#if typeof value.text === "string"}
  <div class="text">
    <label
      class="label"
      for="text"
      title="Use shift-enter to create a multiline string">Text</label
    >
    <TextInput
      id="text"
      value={value.text}
      oninput={(value) => onchange({ property: "text", value })}
    />
  </div>
{/if}

{#if fontPanel}
  <Panel
    title="Font"
    expanded={expanded.font}
    setExpanded={(val) => setExpanded?.("font", val)}
  >
    <Box gap={6} padding={8}>
      {#if typeof value.fontFamily === "string"}
        <Property
          label="Family"
          hint="The font family, can be a single font name, or a list of names where the first is the preferred font."
        >
          <TextInput
            value={value.fontFamily}
            setValue={(value) => onchange({ property: "fontFamily", value })}
          />
        </Property>
      {/if}
      {#if typeof value.fontSize === "number"}
        <Property label="Size" hint="The font size">
          <NumberInput
            value={value.fontSize}
            min={0}
            step={1}
            setValue={(value) => onchange({ property: "fontSize", value })}
          />
        </Property>
      {/if}
      {#if typeof value.fontStyle === "string"}
        <Property label="Style" hint="The font style">
          <Grid cols={3}>
            <ToggleButton
              label="Normal"
              value={value.fontStyle === "normal"}
              rounded="left"
              setValue={() =>
                onchange({ property: "fontStyle", value: "normal" })}
            />
            <ToggleButton
              icon="italic"
              label="Italic"
              value={value.fontStyle === "italic"}
              rounded="none"
              setValue={() =>
                onchange({ property: "fontStyle", value: "italic" })}
            />
            <ToggleButton
              label="Oblique"
              value={value.fontStyle === "oblique"}
              rounded="right"
              setValue={() =>
                onchange({ property: "fontStyle", value: "oblique" })}
            />
          </Grid>
        </Property>
      {/if}
      {#if typeof value.fontVariant === "string"}
        <Property label="Variant" hint="The font variant">
          <Grid cols={2}>
            <ToggleButton
              label="Normal"
              value={value.fontVariant === "normal"}
              rounded="left"
              setValue={() =>
                onchange({ property: "fontVariant", value: "normal" })}
            />

            <ToggleButton
              icon="small-caps"
              label="Small Caps"
              value={value.fontVariant === "small-caps"}
              rounded="right"
              setValue={() =>
                onchange({
                  property: "fontVariant",
                  value: "small-caps",
                })}
            />
          </Grid>
        </Property>
      {/if}
      {#if typeof value.fontWeight === "string"}
        <Property label="Weight" hint="The font weight">
          <SelectMenu
            value={value.fontWeight}
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
    </Box>
  </Panel>
{/if}

{#if alignmentPanel}
  <Panel
    title="Alignment"
    expanded={expanded.alignment}
    setExpanded={(val) => setExpanded?.("alignment", val)}
  >
    <Box gap={6} padding={8}>
      {#if typeof value.align === "string"}
        <Property
          label="Align"
          hint="Alignment for multiline text, does not affect single line text"
        >
          <SelectMenu
            value={value.align}
            options={alignOptions}
            setValue={(value) => onchange({ property: "align", value })}
          />
        </Property>
      {/if}
      {#if typeof value.textBaseline === "string"}
        <Property
          label="Baseline"
          hint="The baseline of the text that is rendered."
        >
          <SelectMenu
            value={value.textBaseline}
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
    </Box>
  </Panel>
{/if}

{#if spacingPanel}
  <Panel
    title="Spacing"
    expanded={expanded.spacing}
    setExpanded={(val) => setExpanded?.("spacing", val)}
  >
    <Box gap={2}>
      {#if typeof value.leading === "number"}
        <Property label="Leading" hint="The space between lines">
          <NumberInput
            value={value.leading}
            min={0}
            step={0.1}
            setValue={(value) => onchange({ property: "leading", value })}
          />
        </Property>
      {/if}
      {#if typeof value.letterSpacing === "number"}
        <Property
          label="Letter spacing"
          hint="The amount of spacing between letters"
        >
          <NumberInput
            value={value.letterSpacing}
            step={0.1}
            setValue={(value) =>
              onchange({
                property: "letterSpacing",
                value,
              })}
          />
        </Property>
      {/if}

      {#if typeof value.lineHeight === "number"}
        <Property
          label="Line height"
          hint="The line height, a number that represents the vertical space that a letter uses"
        >
          <NumberInput
            value={value.lineHeight}
            step={1}
            setValue={(value) => onchange({ property: "lineHeight", value })}
          />
        </Property>
      {/if}
      {#if typeof value.padding === "number"}
        <Property label="Padding">
          <NumberInput
            value={value.padding}
            min={0}
            step={1}
            setValue={(value) => onchange({ property: "padding", value })}
          />
        </Property>
      {/if}
      {#if typeof value.whiteSpace === "string"}
        <Property
          label="White Space"
          hint="Determines whether newlines & spaces are collapsed or preserved"
        >
          <Grid cols={3}>
            <ToggleButton
              label="Normal"
              value={value.whiteSpace === "normal"}
              rounded="left"
              setValue={() =>
                onchange({ property: "whiteSpace", value: "normal" })}
            />
            <ToggleButton
              label="Pre"
              value={value.whiteSpace === "pre"}
              rounded="none"
              setValue={() =>
                onchange({ property: "whiteSpace", value: "pre" })}
            />
            <ToggleButton
              label="Pre Line"
              value={value.whiteSpace === "pre-line"}
              rounded="right"
              setValue={() =>
                onchange({ property: "whiteSpace", value: "pre-line" })}
            />
          </Grid>
        </Property>
      {/if}
      {#if typeof value.trim === "boolean"}
        <Property>
          <CheckboxInput
            value={value.trim}
            hint="Trim transparent borders"
            setValue={(value) => onchange({ property: "trim", value })}
          >
            Trim
          </CheckboxInput>
        </Property>
      {/if}
    </Box>
  </Panel>
{/if}

{#if typeof value.wordWrap === "boolean"}
  <Panel
    title="Word wrap"
    value={value.wordWrap}
    expanded={expanded.wordWrap}
    setValue={(value) => onchange({ property: "wordWrap", value })}
    setExpanded={(val) => setExpanded?.("wordWrap", val)}
  >
    <Box gap={6} padding={8}>
      {#if typeof value.wordWrapWidth === "number"}
        <Property
          label="Width"
          hint="The width at which text will wrap, it needs wordWrap to be set to true"
        >
          <NumberInput
            value={value.wordWrapWidth}
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
      {#if typeof value.breakWords === "boolean"}
        <Property>
          <CheckboxInput
            value={value.breakWords}
            hint="Indicates if lines can be wrapped within words, it needs wordWrap to be set to true."
            setValue={(value) => onchange({ property: "breakWords", value })}
          >
            Break words
          </CheckboxInput>
        </Property>
      {/if}
    </Box>
  </Panel>
{/if}

{#if dropShadowPanel}
  <Panel
    title="Drop shadow"
    value={value.dropShadow}
    expanded={expanded.dropShadow}
    setValue={(value) => onchange({ property: "dropShadow", value })}
    setExpanded={(val) => setExpanded?.("dropShadow", val)}
  >
    <Box gap={6} padding={8}>
      {#if typeof value.dropShadowAlpha === "number"}
        <Property label="Alpha" hint="Set alpha for the drop shadow">
          <NumberInput
            value={value.dropShadowAlpha}
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
      {#if typeof value.dropShadowColor === "string"}
        <Property
          label="Color"
          hint="A fill style to be used on the dropshadow"
        >
          <TextInput
            value={value.dropShadowColor}
            setValue={(value) =>
              onchange({
                property: "dropShadowColor",
                value,
              })}
          />
        </Property>
      {/if}
      {#if typeof value.dropShadowAngle === "number"}
        <Property label="Angle" hint="Set a angle of the drop shadow">
          <NumberInput
            value={value.dropShadowAngle}
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
      {#if typeof value.dropShadowBlur === "number"}
        <Property label="Blur" hint="Set a shadow blur radius">
          <NumberInput
            value={value.dropShadowBlur}
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
      {#if typeof value.dropShadowDistance === "number"}
        <Property label="Distance" hint="Set a distance of the drop shadow">
          <NumberInput
            value={value.dropShadowDistance}
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
    </Box>
  </Panel>
{/if}

{#if strokePanel}
  <Panel
    title="Stroke"
    expanded={expanded.stroke}
    setExpanded={(val) => setExpanded?.("stroke", val)}
  >
    <Box gap={6} padding={8}>
      {#if typeof value.stroke === "string"}
        <Property
          label="Stroke"
          hint="A canvas fillstyle that will be used on the text stroke"
        >
          <TextInput
            value={value.stroke}
            setValue={(value) =>
              onchange({
                property: "stroke",
                value,
              })}
          />
        </Property>
      {/if}
      {#if typeof value.strokeThickness === "number"}
        <Property
          label="Thickness"
          hint="A number that represents the thickness of the stroke"
        >
          <NumberInput
            value={value.strokeThickness}
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
    </Box>
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
    padding-bottom: 4px;

    & .label {
      flex-shrink: 0;
      margin-right: 8px;
    }
  }
</style>
