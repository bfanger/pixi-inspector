<script lang="ts">
  import CheckboxInput from "blender-elements/src/CheckboxInput/CheckboxInput.svelte";
  import NumberInput from "blender-elements/src/NumberInput/NumberInput.svelte";
  import Panel from "blender-elements/src/Panel/Panel.svelte";
  import Property from "blender-elements/src/Property/Property.svelte";
  import SelectMenu from "blender-elements/src/SelectMenu/SelectMenu.svelte";
  import Box from "blender-elements/src/Box/Box.svelte";
  import type { NodeProperties } from "./types";

  type Props = {
    value: NodeProperties;
    expanded: Record<string, boolean>;
    setValue: (update: { property: string; value: any }) => void;
    setExpanded?: (section: string, expanded: boolean) => void;
  };

  let { value, expanded, setValue, setExpanded }: Props = $props();

  let transformPanel = $derived(
    typeof value.x === "number" ||
      typeof value.angle === "number" ||
      typeof value.scaleX === "number",
  );

  let transformOriginPanel = $derived(
    typeof value.originX === "number" ||
      typeof value.anchorX === "number" ||
      typeof value.pivotX === "number",
  );

  let visibilityPanel = $derived(
    typeof value.alpha === "number" || typeof value.visible === "boolean",
  );
  let renderPanel = $derived(
    typeof value.sortableChildren === "boolean" ||
      typeof value.zIndex === "number" ||
      typeof value.cullable === "boolean",
  );

  let interactivePanel = $derived(
    typeof value.interactive === "boolean" ||
      typeof value.interactiveChildren === "boolean",
  );

  let skewDimensionsPanel = $state("");
  $effect.pre(() => {
    if (typeof value.width === "number" && typeof value.skewX === "number") {
      skewDimensionsPanel = "Skew & Dimensions";
    } else if (typeof value.width === "number") {
      skewDimensionsPanel = "Dimensions";
    } else if (typeof value.skewX === "number") {
      skewDimensionsPanel = "Skew";
    } else {
      skewDimensionsPanel = "";
    }
  });
</script>

{#if transformPanel}
  <Panel
    title="Transform"
    expanded={expanded.transform}
    setExpanded={(val) => setExpanded?.("transform", val)}
  >
    <Box gap={6} padding={8}>
      <Box gap={1}>
        <Property label="Location X">
          <NumberInput
            value={value.x}
            step={1}
            rounded="top"
            setValue={(value) => setValue({ property: "x", value })}
          />
        </Property>
        <Property label="Y">
          <NumberInput
            value={value.y}
            step={1}
            rounded="bottom"
            setValue={(value) => setValue({ property: "y", value })}
          />
        </Property>
      </Box>

      {#if typeof value.angle === "number"}
        <Property label="Angle" hint="The angle of the object in degrees">
          <NumberInput
            value={value.angle}
            step={1}
            suffix="°"
            setValue={(value) => setValue({ property: "angle", value })}
          />
        </Property>
      {/if}
      {#if typeof value.scaleX === "number"}
        <Box gap={1}>
          <Property
            label="Scale X"
            hint="The scale factors of this object along the local coordinate axes"
          >
            <NumberInput
              value={value.scaleX}
              step={0.05}
              rounded="top"
              setValue={(value) => setValue({ property: "scaleX", value })}
            />
          </Property>
          <Property label="Y">
            <NumberInput
              value={value.scaleY}
              step={0.1}
              rounded="bottom"
              setValue={(value) => setValue({ property: "scaleY", value })}
            />
          </Property>
        </Box>
      {/if}
    </Box>
  </Panel>
{/if}
{#if transformOriginPanel}
  <Panel
    title="Transform Origin"
    expanded={expanded.transformOrigin}
    setExpanded={(val) => setExpanded?.("transformOrigin", val)}
  >
    <Box gap={6} padding={8}>
      {#if typeof value.anchorX === "number"}
        <Box gap={1}>
          <Property label="Anchor X">
            <NumberInput
              value={value.anchorX}
              step={0.01}
              min={0}
              max={1}
              rounded="top"
              setValue={(value) => setValue({ property: "anchorX", value })}
            />
          </Property>
          <Property label="Y">
            <NumberInput
              value={value.anchorY}
              step={0.01}
              min={0}
              max={1}
              rounded="bottom"
              setValue={(value) => setValue({ property: "anchorY", value })}
            />
          </Property>
        </Box>
      {/if}
      {#if typeof value.originX === "number"}
        <Box gap={1}>
          <Property label="Origin X">
            <NumberInput
              value={value.originX}
              step={0.01}
              min={0}
              max={1}
              rounded="top"
              setValue={(value) => setValue({ property: "originX", value })}
            />
          </Property>
          <Property label="Y">
            <NumberInput
              value={value.originY}
              step={0.01}
              min={0}
              max={1}
              rounded="bottom"
              setValue={(value) => setValue({ property: "originY", value })}
            />
          </Property>
        </Box>
      {/if}
      {#if typeof value.pivotX === "number"}
        <Box gap={1}>
          <Property
            label="Pivot X"
            hint="The center of rotation, scaling, and skewing for this display object in its local space"
          >
            <NumberInput
              value={value.pivotX}
              step={0.1}
              rounded="top"
              setValue={(value) => setValue({ property: "pivotX", value })}
            />
          </Property>
          <Property label="Y">
            <NumberInput
              value={value.pivotY}
              step={0.1}
              rounded="bottom"
              setValue={(value) => setValue({ property: "pivotY", value })}
            /></Property
          >
        </Box>
      {/if}
    </Box>
  </Panel>
{/if}
{#if visibilityPanel}
  <Panel
    title="Visibility"
    expanded={expanded.visibility}
    setExpanded={(val) => setExpanded?.("visibility", val)}
  >
    <Box gap={6} padding={8}>
      {#if typeof value.alpha === "number"}
        <Property label="Alpha" hint="The opacity of the object">
          <NumberInput
            value={value.alpha}
            step={0.01}
            min={0}
            max={1}
            setValue={(value) => setValue({ property: "alpha", value })}
          />
        </Property>
      {/if}
      {#if typeof value.visible === "boolean"}
        <Property>
          <CheckboxInput
            value={value.visible}
            hint="The visibility of the object"
            setValue={(value) => setValue({ property: "visible", value })}
          >
            Visible
          </CheckboxInput>
        </Property>
      {/if}
    </Box>
  </Panel>
{/if}
{#if renderPanel}
  <Panel
    title="Rendering"
    expanded={expanded.rendering}
    setExpanded={(val) => setExpanded?.("rendering", val)}
  >
    <Box gap={6} padding={8}>
      {#if typeof value.sortableChildren === "boolean"}
        <Property>
          <CheckboxInput
            value={value.sortableChildren}
            hint="If set to true, the container will sort its children by zIndex value"
            setValue={(value) =>
              setValue({
                property: "sortableChildren",
                value,
              })}
          >
            Sortable children
          </CheckboxInput>
        </Property>
      {/if}
      {#if typeof value.zIndex === "number"}
        <Property label="Z Index">
          <NumberInput
            value={value.zIndex}
            setValue={(value) => setValue({ property: "zIndex", value })}
          />
        </Property>
      {/if}
      {#if typeof value.cullable === "boolean"}
        <Property>
          <CheckboxInput
            value={value.cullable}
            hint="Should this object be rendered if the bounds of this object are out of frame?"
            setValue={(value) => setValue({ property: "cullable", value })}
          >
            Cullable
          </CheckboxInput>
        </Property>
      {/if}
    </Box>
  </Panel>
{/if}

{#if skewDimensionsPanel}
  <Panel
    title={skewDimensionsPanel}
    expanded={expanded.skewDimensions}
    setExpanded={(val) => setExpanded?.("skewDimensions", val)}
  >
    <Box gap={6} padding={8}>
      {#if typeof value.skewX === "number"}
        <Box gap={1}>
          <Property
            label="Skew X"
            hint="The skew factor for the object in radians"
          >
            <NumberInput
              value={value.skewX}
              step={0.01}
              suffix="r"
              rounded="top"
              setValue={(value) => setValue({ property: "skewX", value })}
            />
          </Property>
          <Property label="Y">
            <NumberInput
              value={value.skewY}
              step={0.01}
              suffix="r"
              rounded="bottom"
              setValue={(value) => setValue({ property: "skewY", value })}
            />
          </Property>
        </Box>
      {/if}
      {#if typeof value.width === "number"}
        <Box gap={1}>
          <Property label="Width">
            <NumberInput
              value={value.width}
              step={1}
              rounded="top"
              setValue={(value) => setValue({ property: "width", value })}
            />
          </Property>
          <Property label="Height">
            <NumberInput
              value={value.height}
              step={1}
              rounded="bottom"
              setValue={(value) => setValue({ property: "height", value })}
            />
          </Property>
        </Box>
      {/if}
    </Box>
  </Panel>
{/if}
{#if interactivePanel}
  <Panel
    title="Interactivity"
    expanded={expanded.interactive}
    setExpanded={(val) => setExpanded?.("interactive", val)}
  >
    <Box gap={6} padding={8}>
      {#if typeof value.eventMode === "string"}
        <Property
          label="Event mode"
          hint="Enable interaction events for the Container. Touch, pointer and mouse. This now replaces the interactive property."
        >
          <SelectMenu
            value={value.eventMode}
            options={[
              { value: "none", label: "None" },
              { value: "passive", label: "Passive" },
              { value: "auto", label: "Auto" },
              { value: "static", label: "Static" },
              { value: "dynamic", label: "Dynamic" },
            ]}
            setValue={(value) => setValue({ property: "eventMode", value })}
          />
        </Property>
        <Property label="Cursor">
          <SelectMenu
            value={value.cursor ?? ""}
            options={[
              ...(value.cursor ? [] : [{ value: "", label: "" }]),
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
              setValue({
                property: "cursor",
                value: value === "" ? undefined : value,
              })}
          />
        </Property>
      {/if}
      {#if typeof value.interactive === "boolean"}
        <Property>
          <CheckboxInput
            value={value.interactive}
            hint="Enable interaction events for the Container. Touch, pointer and mouse"
            setValue={(value) => setValue({ property: "interactive", value })}
          >
            Interactive
          </CheckboxInput>
        </Property>
      {/if}

      {#if typeof value.buttonMode === "boolean"}
        <Property>
          <CheckboxInput
            value={value.buttonMode}
            hint="If enabled, the mouse cursor use the pointer behavior when hovered over the Container if it is interactive Setting this changes the 'cursor' property to 'pointer'."
            setValue={(value) => setValue({ property: "buttonMode", value })}
          >
            Button mode
          </CheckboxInput>
        </Property>
      {/if}
      {#if typeof value.interactiveChildren === "boolean"}
        <Property>
          <CheckboxInput
            value={value.interactiveChildren}
            hint="Determines if the children to the Container can be clicked/touched Setting this to false allows PixiJS to bypass a recursive hitTest function"
            setValue={(value) =>
              setValue({
                property: "interactiveChildren",
                value,
              })}
          >
            Interactive children
          </CheckboxInput>
        </Property>
      {/if}
    </Box>
  </Panel>
{/if}
