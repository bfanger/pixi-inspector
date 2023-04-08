<script lang="ts">
  import NumberInput from "blender-elements/src/NumberInput/NumberInput.svelte";
  import { getBridgeContext, poll } from "./bridge-fns";
  import type { NodeProperties } from "./types";
  import Panel from "blender-elements/src/Panel/Panel.svelte";
  import Checkbox from "blender-elements/src/Checkbox/Checkbox.svelte";

  const bridge = getBridgeContext();

  const props = poll<NodeProperties>(
    bridge,
    "__PIXI_DEVTOOLS__.properties.getAll()",
    250
  );
  export const refresh = props.sync;
  $: transformPanel =
    typeof $props.data?.x === "number" ||
    typeof $props.data?.angle === "number" ||
    typeof $props.data?.scaleX === "number" ||
    typeof $props.data?.skewX === "number";

  $: transformOriginPanel =
    typeof $props.data?.originX === "number" ||
    typeof $props.data?.anchorX === "number" ||
    typeof $props.data?.pivotX === "number";

  $: visibilityPanel =
    typeof $props.data?.alpha === "number" ||
    typeof $props.data?.visible === "boolean";

  function onChange(prop: string, value: number | boolean) {
    bridge(
      `__PIXI_DEVTOOLS__.properties.set(${JSON.stringify(
        prop
      )}, ${JSON.stringify(value)})`
    );
    props.sync();
  }
</script>

{#if $props.data}
  <div class="panels">
    {#if transformPanel}
      <Panel title="Transform">
        <div class="properties">
          <label class="label" for="">Location X</label>
          <NumberInput
            value={$props.data.x}
            step={1}
            location="TOP"
            on:change={(e) => onChange("x", e.detail)}
          />
          <label class="label" for="">Y</label>
          <NumberInput
            value={$props.data.y}
            step={1}
            location="BOTTOM"
            on:change={(e) => onChange("y", e.detail)}
          />
        </div>
        {#if typeof $props.data.angle === "number"}
          <div class="properties">
            <label class="label" for="">Angle</label>
            <NumberInput
              value={$props.data.angle}
              step={1}
              suffix="°"
              on:change={(e) => onChange("angle", e.detail)}
            />
          </div>
        {/if}
        {#if typeof $props.data.scaleX === "number"}
          <div class="properties">
            <label class="label" for="">Scale X</label>
            <NumberInput
              value={$props.data.scaleX}
              step={0.05}
              location="TOP"
              on:change={(e) => onChange("scaleX", e.detail)}
            />
            <label class="label" for="">Y</label>
            <NumberInput
              value={$props.data.scaleY}
              step={0.1}
              location="BOTTOM"
              on:change={(e) => onChange("scaleY", e.detail)}
            />
          </div>
        {/if}
        {#if typeof $props.data.skewX === "number"}
          <div class="properties">
            <label class="label" for="">Skew X</label>
            <NumberInput
              value={$props.data.skewX}
              step={0.01}
              suffix="r"
              location="TOP"
              on:change={(e) => onChange("skewX", e.detail)}
            />
            <label class="label" for="">Y</label>
            <NumberInput
              value={$props.data.skewY}
              step={0.01}
              suffix="r"
              location="BOTTOM"
              on:change={(e) => onChange("skewY", e.detail)}
            />
          </div>
        {/if}
        {#if typeof $props.data.width === "number"}
          <div class="properties">
            <label class="label" for="">Width</label>
            <NumberInput
              value={$props.data.width}
              step={1}
              location="TOP"
              on:change={(e) => onChange("width", e.detail)}
            />
            <label class="label" for="">Height</label>
            <NumberInput
              value={$props.data.height}
              step={1}
              location="BOTTOM"
              on:change={(e) => onChange("height", e.detail)}
            />
          </div>
        {/if}
      </Panel>
      {#if transformOriginPanel}
        <Panel title="Transform Origin">
          {#if typeof $props.data.anchorX === "number"}
            <div class="properties">
              <label class="label" for="">Anchor X</label>
              <NumberInput
                value={$props.data.anchorX}
                step={0.01}
                min={0}
                max={1}
                location="TOP"
                on:change={(e) => onChange("anchorX", e.detail)}
              />
              <label class="label" for="">Y</label>
              <NumberInput
                value={$props.data.anchorY}
                step={0.01}
                min={0}
                max={1}
                location="BOTTOM"
                on:change={(e) => onChange("anchorY", e.detail)}
              />
            </div>
          {/if}
          {#if typeof $props.data.originX === "number"}
            <div class="properties">
              <label class="label" for="">Origin X</label>
              <NumberInput
                value={$props.data.originX}
                step={0.01}
                min={0}
                max={1}
                location="TOP"
                on:change={(e) => onChange("originX", e.detail)}
              />
              <label class="label" for="">Y</label>
              <NumberInput
                value={$props.data.originY}
                step={0.01}
                min={0}
                max={1}
                location="BOTTOM"
                on:change={(e) => onChange("originY", e.detail)}
              />
            </div>
          {/if}
          {#if typeof $props.data.pivotX === "number"}
            <div class="properties">
              <label class="label" for="">Pivot X</label>
              <NumberInput
                value={$props.data.pivotX}
                step={0.1}
                location="TOP"
                on:change={(e) => onChange("pivotX", e.detail)}
              />
              <label class="label" for="">Y</label>
              <NumberInput
                value={$props.data.pivotY}
                step={0.1}
                location="BOTTOM"
                on:change={(e) => onChange("pivotY", e.detail)}
              />
            </div>
          {/if}
        </Panel>
        {#if visibilityPanel}
          <Panel title="Visibility">
            {#if typeof $props.data.alpha === "number"}
              <div class="properties">
                <label class="label" for="">Alpha</label>
                <NumberInput
                  value={$props.data.alpha}
                  step={0.01}
                  min={0}
                  max={1}
                  on:change={(e) => onChange("alpha", e.detail)}
                />
              </div>
            {/if}
            {#if typeof $props.data.visible === "boolean"}
              <div class="properties">
                <div class="label" />
                <Checkbox
                  value={$props.data.visible}
                  on:toggle={(e) => onChange("visible", e.detail)}
                >
                  Visible
                </Checkbox>
              </div>
            {/if}
          </Panel>
        {/if}
      {/if}
    {/if}
  </div>
{/if}

<style>
  .panels {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 8px;
  }
  .properties {
    display: grid;
    grid-template-columns: minmax(100px, 1fr) 2fr;
    margin-bottom: 6px;
  }
  .label {
    text-align: right;
    margin-right: 8px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    user-select: none;
  }
</style>
