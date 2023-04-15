<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import type { NodeProperties } from "./types";
  import Panel from "blender-elements/src/Panel/Panel.svelte";
  import NumberField from "blender-elements/src/NumberField/NumberField.svelte";
  import Checkbox from "blender-elements/src/Checkbox/Checkbox.svelte";
  import Property from "blender-elements/src/Property/Property.svelte";

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
    <Property label="Location X" group>
      <NumberField
        value={props.x}
        step={1}
        location="TOP"
        on:change={(e) =>
          dispatch("change", { property: "x", value: e.detail })}
      />
    </Property>
    <Property label="Y">
      <NumberField
        value={props.y}
        step={1}
        location="BOTTOM"
        on:change={(e) =>
          dispatch("change", { property: "y", value: e.detail })}
      />
    </Property>

    {#if typeof props.angle === "number"}
      <Property label="Angle" hint="The angle of the object in degrees">
        <NumberField
          value={props.angle}
          step={1}
          suffix="°"
          on:change={(e) =>
            dispatch("change", { property: "angle", value: e.detail })}
        />
      </Property>
    {/if}
    {#if typeof props.scaleX === "number"}
      <Property
        label="Scale X"
        group
        hint="The scale factors of this object along the local coordinate axes"
      >
        <NumberField
          value={props.scaleX}
          step={0.05}
          location="TOP"
          on:change={(e) =>
            dispatch("change", { property: "scaleX", value: e.detail })}
        />
      </Property>
      <Property label="Y">
        <NumberField
          value={props.scaleY}
          step={0.1}
          location="BOTTOM"
          on:change={(e) =>
            dispatch("change", { property: "scaleY", value: e.detail })}
        />
      </Property>
    {/if}
  </Panel>
{/if}
{#if transformOriginPanel}
  <Panel title="Transform Origin" bind:expanded={expanded.transformOrigin}>
    {#if typeof props.anchorX === "number"}
      <Property label="Anchor X" group>
        <NumberField
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
        <NumberField
          value={props.anchorY}
          step={0.01}
          min={0}
          max={1}
          location="BOTTOM"
          on:change={(e) =>
            dispatch("change", { property: "anchorY", value: e.detail })}
        />
      </Property>
    {/if}
    {#if typeof props.originX === "number"}
      <Property label="Origin X" group>
        <NumberField
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
        <NumberField
          value={props.originY}
          step={0.01}
          min={0}
          max={1}
          location="BOTTOM"
          on:change={(e) =>
            dispatch("change", { property: "originY", value: e.detail })}
        />
      </Property>
    {/if}
    {#if typeof props.pivotX === "number"}
      <Property
        label="Pivot X"
        group
        hint="The center of rotation, scaling, and skewing for this display object in its local space"
      >
        <NumberField
          value={props.pivotX}
          step={0.1}
          location="TOP"
          on:change={(e) =>
            dispatch("change", { property: "pivotX", value: e.detail })}
        />
      </Property>
      <Property label="Y">
        <NumberField
          value={props.pivotY}
          step={0.1}
          location="BOTTOM"
          on:change={(e) =>
            dispatch("change", { property: "pivotY", value: e.detail })}
        /></Property
      >
    {/if}
  </Panel>
{/if}
{#if visibilityPanel}
  <Panel title="Visibility" bind:expanded={expanded.visibility}>
    {#if typeof props.alpha === "number"}
      <Property label="Alpha" hint="The opacity of the object">
        <NumberField
          value={props.alpha}
          step={0.01}
          min={0}
          max={1}
          on:change={(e) =>
            dispatch("change", { property: "alpha", value: e.detail })}
        />
      </Property>
    {/if}
    {#if typeof props.visible === "boolean"}
      <Property>
        <Checkbox
          value={props.visible}
          hint="The visibility of the object"
          on:change={(e) =>
            dispatch("change", { property: "visible", value: e.detail })}
        >
          Visible
        </Checkbox>
      </Property>
    {/if}
    {#if typeof props.cullable === "boolean"}
      <Property>
        <Checkbox
          value={props.cullable}
          hint="Should this object be rendered if the bounds of this object are out of frame?"
          on:change={(e) =>
            dispatch("change", { property: "cullable", value: e.detail })}
        >
          Cullable
        </Checkbox>
      </Property>
    {/if}
  </Panel>
{/if}
{#if skewDimensionsPanel}
  <Panel title={skewDimensionsPanel} bind:expanded={expanded.skewDimensions}>
    {#if typeof props.skewX === "number"}
      <Property
        label="Skew X"
        group
        hint="The skew factor for the object in radians"
      >
        <NumberField
          value={props.skewX}
          step={0.01}
          suffix="r"
          location="TOP"
          on:change={(e) =>
            dispatch("change", { property: "skewX", value: e.detail })}
        />
      </Property>
      <Property label="Y">
        <NumberField
          value={props.skewY}
          step={0.01}
          suffix="r"
          location="BOTTOM"
          on:change={(e) =>
            dispatch("change", { property: "skewY", value: e.detail })}
        />
      </Property>
    {/if}
    {#if typeof props.width === "number"}
      <Property label="Width" group>
        <NumberField
          value={props.width}
          step={1}
          location="TOP"
          on:change={(e) =>
            dispatch("change", { property: "width", value: e.detail })}
        />
      </Property>
      <Property label="Height">
        <NumberField
          value={props.height}
          step={1}
          location="BOTTOM"
          on:change={(e) =>
            dispatch("change", { property: "height", value: e.detail })}
        />
      </Property>
    {/if}
  </Panel>
{/if}
