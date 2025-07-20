<script lang="ts">
  import Checkbox from "blender-elements/src/Checkbox/Checkbox.svelte";
  import NumberField from "blender-elements/src/NumberField/NumberField.svelte";
  import Panel from "blender-elements/src/Panel/Panel.svelte";
  import Property from "blender-elements/src/Property/Property.svelte";
  import SelectMenu from "blender-elements/src/SelectMenu/SelectMenu.svelte";
  import type { NodeProperties } from "./types";
  import PropertyGroup from "../../blender-elements/src/Property/PropertyGroup.svelte";
  import PropertyGroups from "../../blender-elements/src/Property/PropertyGroups.svelte";

  type Props = {
    props: NodeProperties;
    expanded: Record<string, boolean>;
    onchange: (change: {
      property: string;
      value: number | boolean | string | undefined;
    }) => void;
  };

  let { props, expanded = $bindable(), onchange }: Props = $props();

  let transformPanel = $derived(
    typeof props.x === "number" ||
      typeof props.angle === "number" ||
      typeof props.scaleX === "number",
  );

  let transformOriginPanel = $derived(
    typeof props.originX === "number" ||
      typeof props.anchorX === "number" ||
      typeof props.pivotX === "number",
  );

  let visibilityPanel = $derived(
    typeof props.alpha === "number" || typeof props.visible === "boolean",
  );
  let renderPanel = $derived(
    typeof props.sortableChildren === "boolean" ||
      typeof props.zIndex === "number" ||
      typeof props.cullable === "boolean",
  );

  let interactivePanel = $derived(
    typeof props.interactive === "boolean" ||
      typeof props.interactiveChildren === "boolean",
  );

  let skewDimensionsPanel = $state("");
  $effect.pre(() => {
    if (typeof props.width === "number" && typeof props.skewX === "number") {
      skewDimensionsPanel = "Skew & Dimensions";
    } else if (typeof props.width === "number") {
      skewDimensionsPanel = "Dimensions";
    } else if (typeof props.skewX === "number") {
      skewDimensionsPanel = "Skew";
    } else {
      skewDimensionsPanel = "";
    }
  });
</script>

{#if transformPanel}
  <Panel title="Transform" bind:expanded={expanded.transform}>
    <PropertyGroups>
      <PropertyGroup>
        <Property label="Location X">
          <NumberField
            value={props.x}
            step={1}
            rounded="top"
            setValue={(value) => onchange({ property: "x", value })}
          />
        </Property>
        <Property label="Y">
          <NumberField
            value={props.y}
            step={1}
            rounded="bottom"
            setValue={(value) => onchange({ property: "y", value })}
          />
        </Property>
      </PropertyGroup>

      {#if typeof props.angle === "number"}
        <Property label="Angle" hint="The angle of the object in degrees">
          <NumberField
            value={props.angle}
            step={1}
            suffix="°"
            setValue={(value) => onchange({ property: "angle", value })}
          />
        </Property>
      {/if}
      {#if typeof props.scaleX === "number"}
        <PropertyGroup>
          <Property
            label="Scale X"
            hint="The scale factors of this object along the local coordinate axes"
          >
            <NumberField
              value={props.scaleX}
              step={0.05}
              rounded="top"
              setValue={(value) => onchange({ property: "scaleX", value })}
            />
          </Property>
          <Property label="Y">
            <NumberField
              value={props.scaleY}
              step={0.1}
              rounded="bottom"
              setValue={(value) => onchange({ property: "scaleY", value })}
            />
          </Property>
        </PropertyGroup>
      {/if}
    </PropertyGroups>
  </Panel>
{/if}
{#if transformOriginPanel}
  <Panel title="Transform Origin" bind:expanded={expanded.transformOrigin}>
    <PropertyGroups>
      {#if typeof props.anchorX === "number"}
        <PropertyGroup>
          <Property label="Anchor X">
            <NumberField
              value={props.anchorX}
              step={0.01}
              min={0}
              max={1}
              rounded="top"
              setValue={(value) => onchange({ property: "anchorX", value })}
            />
          </Property>
          <Property label="Y">
            <NumberField
              value={props.anchorY}
              step={0.01}
              min={0}
              max={1}
              rounded="bottom"
              setValue={(value) => onchange({ property: "anchorY", value })}
            />
          </Property>
        </PropertyGroup>
      {/if}
      {#if typeof props.originX === "number"}
        <PropertyGroup>
          <Property label="Origin X">
            <NumberField
              value={props.originX}
              step={0.01}
              min={0}
              max={1}
              rounded="top"
              setValue={(value) => onchange({ property: "originX", value })}
            />
          </Property>
          <Property label="Y">
            <NumberField
              value={props.originY}
              step={0.01}
              min={0}
              max={1}
              rounded="bottom"
              setValue={(value) => onchange({ property: "originY", value })}
            />
          </Property>
        </PropertyGroup>
      {/if}
      {#if typeof props.pivotX === "number"}
        <PropertyGroup>
          <Property
            label="Pivot X"
            hint="The center of rotation, scaling, and skewing for this display object in its local space"
          >
            <NumberField
              value={props.pivotX}
              step={0.1}
              rounded="top"
              setValue={(value) => onchange({ property: "pivotX", value })}
            />
          </Property>
          <Property label="Y">
            <NumberField
              value={props.pivotY}
              step={0.1}
              rounded="bottom"
              setValue={(value) => onchange({ property: "pivotY", value })}
            /></Property
          >
        </PropertyGroup>
      {/if}
    </PropertyGroups>
  </Panel>
{/if}
{#if visibilityPanel}
  <Panel title="Visibility" bind:expanded={expanded.visibility}>
    <PropertyGroups>
      {#if typeof props.alpha === "number"}
        <Property label="Alpha" hint="The opacity of the object">
          <NumberField
            value={props.alpha}
            step={0.01}
            min={0}
            max={1}
            setValue={(value) => onchange({ property: "alpha", value })}
          />
        </Property>
      {/if}
      {#if typeof props.visible === "boolean"}
        <Property>
          <Checkbox
            value={props.visible}
            hint="The visibility of the object"
            setValue={(value) => onchange({ property: "visible", value })}
          >
            Visible
          </Checkbox>
        </Property>
      {/if}
    </PropertyGroups>
  </Panel>
{/if}
{#if renderPanel}
  <Panel title="Rendering" bind:expanded={expanded.rendering}>
    <PropertyGroups>
      {#if typeof props.sortableChildren === "boolean"}
        <Property>
          <Checkbox
            value={props.sortableChildren}
            hint="If set to true, the container will sort its children by zIndex value"
            setValue={(value) =>
              onchange({
                property: "sortableChildren",
                value,
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
            setValue={(value) => onchange({ property: "zIndex", value })}
          />
        </Property>
      {/if}
      {#if typeof props.cullable === "boolean"}
        <Property>
          <Checkbox
            value={props.cullable}
            hint="Should this object be rendered if the bounds of this object are out of frame?"
            setValue={(value) => onchange({ property: "cullable", value })}
          >
            Cullable
          </Checkbox>
        </Property>
      {/if}
    </PropertyGroups>
  </Panel>
{/if}

{#if skewDimensionsPanel}
  <Panel title={skewDimensionsPanel} bind:expanded={expanded.skewDimensions}>
    <PropertyGroups>
      {#if typeof props.skewX === "number"}
        <PropertyGroup>
          <Property
            label="Skew X"
            hint="The skew factor for the object in radians"
          >
            <NumberField
              value={props.skewX}
              step={0.01}
              suffix="r"
              rounded="top"
              setValue={(value) => onchange({ property: "skewX", value })}
            />
          </Property>
          <Property label="Y">
            <NumberField
              value={props.skewY}
              step={0.01}
              suffix="r"
              rounded="bottom"
              setValue={(value) => onchange({ property: "skewY", value })}
            />
          </Property>
        </PropertyGroup>
      {/if}
      {#if typeof props.width === "number"}
        <PropertyGroup>
          <Property label="Width">
            <NumberField
              value={props.width}
              step={1}
              rounded="top"
              setValue={(value) => onchange({ property: "width", value })}
            />
          </Property>
          <Property label="Height">
            <NumberField
              value={props.height}
              step={1}
              rounded="bottom"
              setValue={(value) => onchange({ property: "height", value })}
            />
          </Property>
        </PropertyGroup>
      {/if}
    </PropertyGroups>
  </Panel>
{/if}
{#if interactivePanel}
  <Panel title="Interactivity" bind:expanded={expanded.interactive}>
    <PropertyGroups>
      {#if typeof props.eventMode === "string"}
        <Property
          label="Event mode"
          hint="Enable interaction events for the Container. Touch, pointer and mouse. This now replaces the interactive property."
        >
          <SelectMenu
            value={props.eventMode}
            options={[
              { value: "none", label: "None" },
              { value: "passive", label: "Passive" },
              { value: "auto", label: "Auto" },
              { value: "static", label: "Static" },
              { value: "dynamic", label: "Dynamic" },
            ]}
            setValue={(value) => onchange({ property: "eventMode", value })}
          />
        </Property>
        <Property label="Cursor">
          <SelectMenu
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
            setValue={(value) =>
              onchange({
                property: "cursor",
                value: value === "" ? undefined : value,
              })}
          />
        </Property>
      {/if}
      {#if typeof props.interactive === "boolean"}
        <Property>
          <Checkbox
            value={props.interactive}
            hint="Enable interaction events for the Container. Touch, pointer and mouse"
            setValue={(value) => onchange({ property: "interactive", value })}
          >
            Interactive
          </Checkbox>
        </Property>
      {/if}

      {#if typeof props.buttonMode === "boolean"}
        <Property>
          <Checkbox
            value={props.buttonMode}
            hint="If enabled, the mouse cursor use the pointer behavior when hovered over the Container if it is interactive Setting this changes the 'cursor' property to 'pointer'."
            setValue={(value) => onchange({ property: "buttonMode", value })}
          >
            Button mode
          </Checkbox>
        </Property>
      {/if}
      {#if typeof props.interactiveChildren === "boolean"}
        <Property>
          <Checkbox
            value={props.interactiveChildren}
            hint="Determines if the children to the Container can be clicked/touched Setting this to false allows PixiJS to bypass a recursive hitTest function"
            setValue={(value) =>
              onchange({
                property: "interactiveChildren",
                value,
              })}
          >
            Interactive children
          </Checkbox>
        </Property>
      {/if}
    </PropertyGroups>
  </Panel>
{/if}
