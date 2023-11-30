<script lang="ts">
  import { Quaternion } from "pixi3d";
  import { createEventDispatcher } from "svelte";
  import Panel from "blender-elements/src/Panel/Panel.svelte";
  import NumberField from "blender-elements/src/NumberField/NumberField.svelte";
  import Checkbox from "blender-elements/src/Checkbox/Checkbox.svelte";
  import Property from "blender-elements/src/Property/Property.svelte";
  import SelectMenu from "blender-elements/src/SelectMenu/SelectMenu.svelte";
  import type { NodeProperties, PointLike3D } from "./types";
  import {
    getEulerAngles,
  } from "./pixi-devtools/pixiDevToolsUtil";

  export let props: NodeProperties;
  export let expanded: Record<string, boolean>;

  const dispatch = createEventDispatcher();

  $: transformPanel =
    typeof props.x === "number" ||
    typeof props.angle === "number" ||
    typeof props.scaleX === "number";

  $: container3D = typeof props.z === "number";

  $: transformOriginPanel =
    typeof props.originX === "number" ||
    typeof props.anchorX === "number" ||
    typeof props.pivotX === "number";

  $: visibilityPanel =
    typeof props.alpha === "number" || typeof props.visible === "boolean";
  $: renderPanel =
    typeof props.sortableChildren === "boolean" ||
    typeof props.zIndex === "number" ||
    typeof props.cullable === "boolean";

  $: interactivePanel =
    typeof props.interactive === "boolean" ||
    typeof props.interactiveChildren === "boolean";

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

  let euler = { x: 0, y: 0, z: 0 };
  $: if (
    container3D &&
    typeof props.quatW === "number" &&
    typeof props.quatX === "number" &&
    typeof props.quatY === "number" &&
    typeof props.quatZ === "number"
  ) {
    euler = getEulerAngles({
      x: props.quatX,
      y: props.quatY,
      z: props.quatZ,
      w: props.quatW,
    });
  }

  $: onEulerChange = ({
    x = euler.x,
    y = euler.y,
    z = euler.z,
  }: Partial<PointLike3D>) => {
    euler = { x, y, z };
    const quat = Quaternion.fromEuler(x, y, z);
    dispatch("change", { property: "quatX", value: quat.x });
    dispatch("change", { property: "quatY", value: quat.y });
    dispatch("change", { property: "quatZ", value: quat.z });
    dispatch("change", { property: "quatW", value: quat.w });
  };
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
    <Property label="Y" group={container3D}>
      <NumberField
        value={props.y}
        step={1}
        location={container3D ? "MIDDLE" : "BOTTOM"}
        on:change={(e) =>
          dispatch("change", { property: "y", value: e.detail })}
      />
    </Property>
    {#if container3D}
      <Property label="Z">
        <NumberField
          value={props.z}
          step={1}
          location="BOTTOM"
          on:change={(e) =>
            dispatch("change", { property: "z", value: e.detail })}
        />
      </Property>
    {/if}

    {#if container3D}
      <Property label="Rotation X" group>
        <NumberField
          value={euler.x}
          step={1}
          location="TOP"
          on:change={(e) => onEulerChange({ x: e.detail })}
        />
      </Property>
      <Property label="Y" group>
        <NumberField
          value={euler.y}
          step={1}
          location="MIDDLE"
          on:change={(e) => onEulerChange({ y: e.detail })}
        />
      </Property>
      <Property label="Z">
        <NumberField
          value={euler.z}
          step={1}
          location="BOTTOM"
          on:change={(e) => onEulerChange({ z: e.detail })}
        />
      </Property>

      <Property label="Quaternion X" group>
        <NumberField
          value={props.quatX}
          step={0.1}
          location="TOP"
          on:change={(e) =>
            dispatch("change", { property: "quatX", value: e.detail })}
        />
      </Property>
      <Property label="Y" group>
        <NumberField
          value={props.quatY}
          step={0.1}
          location="MIDDLE"
          on:change={(e) =>
            dispatch("change", { property: "quatY", value: e.detail })}
        />
      </Property>
      <Property label="Z" group>
        <NumberField
          value={props.quatZ}
          step={0.1}
          location="MIDDLE"
          on:change={(e) =>
            dispatch("change", { property: "quatZ", value: e.detail })}
        />
      </Property>
      <Property label="W">
        <NumberField
          value={props.quatW}
          step={0.1}
          location="BOTTOM"
          on:change={(e) =>
            dispatch("change", { property: "quatW", value: e.detail })}
        />
      </Property>
    {/if}
    {#if typeof props.angle === "number" && !container3D}
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
      <Property label="Y" group={container3D}>
        <NumberField
          value={props.scaleY}
          step={0.1}
          location={container3D ? "MIDDLE" : "BOTTOM"}
          on:change={(e) =>
            dispatch("change", { property: "scaleY", value: e.detail })}
        />
      </Property>
      {#if container3D}
        <Property label="Z">
          <NumberField
            value={props.scaleZ}
            step={0.1}
            location="BOTTOM"
            on:change={(e) =>
              dispatch("change", { property: "scaleZ", value: e.detail })}
          />
        </Property>
      {/if}
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
  </Panel>
{/if}
{#if renderPanel}
  <Panel title="Rendering" bind:expanded={expanded.rendering}>
    {#if typeof props.sortableChildren === "boolean"}
      <Property>
        <Checkbox
          value={props.sortableChildren}
          hint="If set to true, the container will sort its children by zIndex value"
          on:change={(e) =>
            dispatch("change", {
              property: "sortableChildren",
              value: e.detail,
            })}
        >
          Sortable children
        </Checkbox>
      </Property>
    {/if}
    {#if typeof props.zIndex === "number"}
      <Property label="Z Index">
        <NumberField
          value={props.zIndex}
          on:change={(e) =>
            dispatch("change", { property: "zIndex", value: e.detail })}
        />
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
{#if interactivePanel}
  <Panel title="Interactivity" bind:expanded={expanded.interactive}>
    {#if typeof props.eventMode === "string"}
      <Property
        label="Event mode"
        hint="Enable interaction events for the DisplayObject. Touch, pointer and mouse. This now replaces the interactive property."
      >
        <SelectMenu
          legend="Event Mode"
          value={props.eventMode}
          options={[
            { value: "none", label: "None" },
            { value: "passive", label: "Passive" },
            { value: "auto", label: "Auto" },
            { value: "static", label: "Static" },
            { value: "dynamic", label: "Dynamic" },
          ]}
          on:change={(e) =>
            dispatch("change", { property: "eventMode", value: e.detail })}
        />
      </Property>
      <Property label="Cursor">
        <SelectMenu
          legend="Cursor"
          value={props.cursor ?? ""}
          options={[
            ...(props.cursor ? [] : [{ value: "", label: "" }]),
            { value: "auto", label: "Auto" },
            { value: "default", label: "Default" },
            { value: "none", label: "None" },
            { value: "context-menu", label: "Context menu" },
            { value: "help", label: "Help" },
            { value: "pointer", label: "Pointer" },
            { value: "progress", label: "Progress" },
            { value: "wait", label: "Wait" },
            { value: "cell", label: "Cell" },
            { value: "crosshair", label: "Crosshair" },
            { value: "text", label: "Text" },
            { value: "vertical-text", label: "Vertical text" },
            { value: "alias", label: "Alias" },
            { value: "copy", label: "Copy" },
            { value: "move", label: "Move" },
            { value: "no-drop", label: "No drop" },
            { value: "not-allowed", label: "Not allowed" },
            { value: "all-scroll", label: "All scroll" },
            { value: "zoom-in", label: "Zoom in" },
            { value: "zoom-out", label: "Zoom out" },
            { value: "grab", label: "Grab" },
            { value: "grabbing", label: "Grabbing" },
            // { value: "e-resize", label: "Resize (East)" },
            // { value: "n-resize", label: "Resize (North)" },
            // { value: "ne-resize", label: "Resize (North East)" },
            // { value: "nw-resize", label: "Resize (North West)" },
            // { value: "s-resize", label: "Resize (South)" },
            // { value: "se-resize", label: "Resize (South East)" },
            // { value: "sw-resize", label: "Resize (South West)" },
            // { value: "w-resize", label: "Resize (West)" },
            // { value: "ns-resize", label: "Resize (North South)" },
            // { value: "ew-resize", label: "Resize (East West)" },
            // { value: "nesw-resize", label: "Resize (North East South West)" },
            // { value: "col-resize", label: "Resize (Column)" },
            // { value: "nwse-resize", label: "Resize (North West South East)" },
            // { value: "row-resize", label: "Resize (Row)" },
          ]}
          on:change={(e) =>
            dispatch("change", {
              property: "cursor",
              value: e.detail === "" ? undefined : e.detail,
            })}
        />
      </Property>
    {/if}
    {#if typeof props.interactive === "boolean"}
      <Property>
        <Checkbox
          value={props.interactive}
          hint="Enable interaction events for the DisplayObject. Touch, pointer and mouse"
          on:change={(e) =>
            dispatch("change", { property: "interactive", value: e.detail })}
        >
          Interactive
        </Checkbox>
      </Property>
    {/if}

    {#if typeof props.buttonMode === "boolean"}
      <Property>
        <Checkbox
          value={props.buttonMode}
          hint="If enabled, the mouse cursor use the pointer behavior when hovered over the displayObject if it is interactive Setting this changes the 'cursor' property to 'pointer'."
          on:change={(e) =>
            dispatch("change", { property: "buttonMode", value: e.detail })}
        >
          Button mode
        </Checkbox>
      </Property>
    {/if}
    {#if typeof props.interactiveChildren === "boolean"}
      <Property>
        <Checkbox
          value={props.interactiveChildren}
          hint="Determines if the children to the displayObject can be clicked/touched Setting this to false allows PixiJS to bypass a recursive hitTest function"
          on:change={(e) =>
            dispatch("change", {
              property: "interactiveChildren",
              value: e.detail,
            })}
        >
          Interactive children
        </Checkbox>
      </Property>
    {/if}
  </Panel>
{/if}
