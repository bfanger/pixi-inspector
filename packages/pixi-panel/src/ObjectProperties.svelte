<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import type { NodeProperties } from "./types";
  import Panel from "blender-elements/src/Panel/Panel.svelte";
  import NumberInput from "blender-elements/src/NumberInput/NumberInput.svelte";
  import Checkbox from "blender-elements/src/Checkbox/Checkbox.svelte";
  import Properties from "blender-elements/src/Properties/Properties.svelte";
  import Property from "blender-elements/src/Properties/Property.svelte";

  export let props: NodeProperties;
  export let expanded: Record<string, boolean>;

  const dispatch = createEventDispatcher();

  $: transformPanel =
    typeof props.x === "number" ||
    typeof props.angle === "number" ||
    typeof props.scaleX === "number";

  $: transformOriginPanel =
    typeof props.originX === "number" ||
    typeof props.anchorX === "number" ||
    typeof props.pivotX === "number";

  $: visibilityPanel =
    typeof props.alpha === "number" || typeof props.visible === "boolean";

  let skewDimensionsPanel = "";
  $: if (typeof props.width === "number" && typeof props.skewX === "number") {
    skewDimensionsPanel = "Skew & Dimensions";
  } else if (typeof props.width === "number") {
    skewDimensionsPanel = "Dimensions";
  } else if (typeof props.skewX === "number") {
    skewDimensionsPanel = "Skew";
  } else {
    skewDimensionsPanel = "";
  }
</script>

{#if transformPanel}
  <Panel title="Transform" bind:expanded={expanded.transform}>
    <Properties>
      <Property label="Location X">
        <NumberInput
          value={props.x}
          step={1}
          location="TOP"
          on:change={(e) =>
            dispatch("change", { property: "x", value: e.detail })}
        />
      </Property>
      <Property label="Y">
        <NumberInput
          value={props.y}
          step={1}
          location="BOTTOM"
          on:change={(e) =>
            dispatch("change", { property: "y", value: e.detail })}
        />
      </Property>
    </Properties>
    {#if typeof props.angle === "number"}
      <Properties>
        <Property label="Angle">
          <NumberInput
            value={props.angle}
            step={1}
            suffix="°"
            on:change={(e) =>
              dispatch("change", { property: "angle", value: e.detail })}
          />
        </Property>
      </Properties>
    {/if}
    {#if typeof props.scaleX === "number"}
      <Properties>
        <Property label="Scale X">
          <NumberInput
            value={props.scaleX}
            step={0.05}
            location="TOP"
            on:change={(e) =>
              dispatch("change", { property: "scaleX", value: e.detail })}
          />
        </Property>
        <Property label="Y">
          <NumberInput
            value={props.scaleY}
            step={0.1}
            location="BOTTOM"
            on:change={(e) =>
              dispatch("change", { property: "scaleY", value: e.detail })}
          />
        </Property>
      </Properties>
    {/if}
  </Panel>
{/if}
{#if transformOriginPanel}
  <Panel title="Transform Origin" bind:expanded={expanded.transformOrigin}>
    {#if typeof props.anchorX === "number"}
      <Properties>
        <Property label="Anchor X">
          <NumberInput
            value={props.anchorX}
            step={0.01}
            min={0}
            max={1}
            location="TOP"
            on:change={(e) =>
              dispatch("change", { property: "anchorX", value: e.detail })}
          />
        </Property>
        <Property label="Y">
          <NumberInput
            value={props.anchorY}
            step={0.01}
            min={0}
            max={1}
            location="BOTTOM"
            on:change={(e) =>
              dispatch("change", { property: "anchorY", value: e.detail })}
          />
        </Property>
      </Properties>
    {/if}
    {#if typeof props.originX === "number"}
      <Properties>
        <Property label="Origin X">
          <NumberInput
            value={props.originX}
            step={0.01}
            min={0}
            max={1}
            location="TOP"
            on:change={(e) =>
              dispatch("change", { property: "originX", value: e.detail })}
          />
        </Property>
        <Property label="Y">
          <NumberInput
            value={props.originY}
            step={0.01}
            min={0}
            max={1}
            location="BOTTOM"
            on:change={(e) =>
              dispatch("change", { property: "originY", value: e.detail })}
          />
        </Property>
      </Properties>
    {/if}
    {#if typeof props.pivotX === "number"}
      <Properties>
        <Property label="Pivot X">
          <NumberInput
            value={props.pivotX}
            step={0.1}
            location="TOP"
            on:change={(e) =>
              dispatch("change", { property: "pivotX", value: e.detail })}
          />
        </Property>
        <Property label="Y">
          <NumberInput
            value={props.pivotY}
            step={0.1}
            location="BOTTOM"
            on:change={(e) =>
              dispatch("change", { property: "pivotY", value: e.detail })}
          /></Property
        >
      </Properties>
    {/if}
  </Panel>
{/if}
{#if visibilityPanel}
  <Panel title="Visibility" bind:expanded={expanded.visibility}>
    {#if typeof props.alpha === "number"}
      <Properties>
        <Property label="Alpha">
          <NumberInput
            value={props.alpha}
            step={0.01}
            min={0}
            max={1}
            on:change={(e) =>
              dispatch("change", { property: "alpha", value: e.detail })}
          />
        </Property>
      </Properties>
    {/if}
    {#if typeof props.visible === "boolean"}
      <Properties>
        <Property>
          <Checkbox
            value={props.visible}
            on:toggle={(e) =>
              dispatch("change", { property: "visible", value: e.detail })}
          >
            Visible
          </Checkbox>
        </Property>
      </Properties>
    {/if}
  </Panel>
{/if}
{#if skewDimensionsPanel}
  <Panel title={skewDimensionsPanel} bind:expanded={expanded.skewDimensions}>
    {#if typeof props.skewX === "number"}
      <Properties>
        <Property label="Skew X">
          <NumberInput
            value={props.skewX}
            step={0.01}
            suffix="r"
            location="TOP"
            on:change={(e) =>
              dispatch("change", { property: "skewX", value: e.detail })}
          />
        </Property>
        <Property label="Y">
          <NumberInput
            value={props.skewY}
            step={0.01}
            suffix="r"
            location="BOTTOM"
            on:change={(e) =>
              dispatch("change", { property: "skewY", value: e.detail })}
          />
        </Property>
      </Properties>
    {/if}
    {#if typeof props.width === "number"}
      <Properties>
        <Property label="Width">
          <NumberInput
            value={props.width}
            step={1}
            location="TOP"
            on:change={(e) =>
              dispatch("change", { property: "width", value: e.detail })}
          />
        </Property>
        <Property label="Height">
          <NumberInput
            value={props.height}
            step={1}
            location="BOTTOM"
            on:change={(e) =>
              dispatch("change", { property: "height", value: e.detail })}
          />
        </Property>
      </Properties>
    {/if}
  </Panel>
{/if}
