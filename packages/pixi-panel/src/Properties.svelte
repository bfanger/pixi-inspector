<script lang="ts">
  import NumberInput from "blender-elements/NumberInput.svelte";
  import { getBridgeContext, poll } from "./bridge-fns";
  import type { NodeProperties } from "./types";

  const bridge = getBridgeContext();

  const props = poll<NodeProperties>(
    bridge,
    "__PIXI_DEVTOOLS__.properties.getAll()",
    250
  );
  export const refresh = props.sync;

  function onChange(prop: string, value: number) {
    bridge(
      `__PIXI_DEVTOOLS__.properties.set(${JSON.stringify(prop)}, ${value})`
    );
    props.sync();
  }
</script>

{#if $props.data && typeof $props.data.x !== "undefined"}
  <section class="section">
    <div class="title">Transform</div>
    <div class="properties">
      <label class="label" for="">Location X</label>
      <div class="input">
        <NumberInput
          value={$props.data.x}
          step={1}
          location="TOP"
          on:change={(e) => onChange("x", e.detail)}
        />
      </div>
      <label class="label" for="">Y</label>
      <div class="input">
        <NumberInput
          value={$props.data.y}
          step={1}
          location="BOTTOM"
          on:change={(e) => onChange("y", e.detail)}
        />
      </div>
    </div>
    {#if typeof $props.data.angle === "number"}
      <div class="properties">
        <label class="label" for="">Angle</label>
        <div class="input">
          <NumberInput
            value={$props.data.angle}
            step={1}
            suffix="°"
            on:change={(e) => onChange("angle", e.detail)}
          />
        </div>
      </div>
    {/if}
    <div class="properties">
      <label class="label" for="">Scale X</label>
      <div class="input">
        <NumberInput
          value={$props.data.scaleX}
          step={0.05}
          location="TOP"
          on:change={(e) => onChange("scaleX", e.detail)}
        />
      </div>
      <label class="label" for="">Y</label>
      <div class="input">
        <NumberInput
          value={$props.data.scaleY}
          step={0.1}
          location="BOTTOM"
          on:change={(e) => onChange("scaleY", e.detail)}
        />
      </div>
    </div>
  </section>
  {#if typeof $props.data.width === "number" || typeof $props.data.skewX === "number"}
    <section class="section">
      <div class="title" />
      {#if typeof $props.data.width === "number"}
        <div class="properties">
          <label class="label" for="">Width</label>
          <div class="input">
            <NumberInput
              value={$props.data.width}
              step={1}
              location="TOP"
              on:change={(e) => onChange("width", e.detail)}
            />
          </div>
          <label class="label" for="">Height</label>
          <div class="input">
            <NumberInput
              value={$props.data.height}
              step={1}
              location="BOTTOM"
              on:change={(e) => onChange("height", e.detail)}
            />
          </div>
        </div>
      {/if}
      {#if typeof $props.data.anchorX === "number"}
        <div class="properties">
          <label class="label" for="">Anchor X</label>
          <div class="input">
            <NumberInput
              value={$props.data.anchorX}
              step={0.01}
              min={0}
              max={1}
              location="TOP"
              on:change={(e) => onChange("anchorX", e.detail)}
            />
          </div>
          <label class="label" for="">Y</label>
          <div class="input">
            <NumberInput
              value={$props.data.anchorY}
              step={0.01}
              min={0}
              max={1}
              location="BOTTOM"
              on:change={(e) => onChange("anchorY", e.detail)}
            />
          </div>
        </div>
      {/if}
      {#if typeof $props.data.pivotX === "number"}
        <div class="properties">
          <label class="label" for="">Pivot X</label>
          <div class="input">
            <NumberInput
              value={$props.data.pivotX}
              step={0.1}
              location="TOP"
              on:change={(e) => onChange("pivotX", e.detail)}
            />
          </div>
          <label class="label" for="">Y</label>
          <div class="input">
            <NumberInput
              value={$props.data.pivotY}
              step={0.1}
              location="BOTTOM"
              on:change={(e) => onChange("pivotY", e.detail)}
            />
          </div>
        </div>
      {/if}
      {#if typeof $props.data.originX === "number"}
        <div class="properties">
          <label class="label" for="">Origin X</label>
          <div class="input">
            <NumberInput
              value={$props.data.originX}
              step={0.01}
              min={0}
              max={1}
              location="TOP"
              on:change={(e) => onChange("originX", e.detail)}
            />
          </div>
          <label class="label" for="">Y</label>
          <div class="input">
            <NumberInput
              value={$props.data.originY}
              step={0.01}
              min={0}
              max={1}
              location="BOTTOM"
              on:change={(e) => onChange("originY", e.detail)}
            />
          </div>
        </div>
      {/if}
      {#if typeof $props.data.skewX === "number"}
        <div class="properties">
          <label class="label" for="">Skew X</label>
          <div class="input">
            <NumberInput
              value={$props.data.skewX}
              step={0.01}
              suffix="r"
              location="TOP"
              on:change={(e) => onChange("skewX", e.detail)}
            />
          </div>
          <label class="label" for="">Y</label>
          <div class="input">
            <NumberInput
              value={$props.data.skewY}
              step={0.01}
              suffix="r"
              location="BOTTOM"
              on:change={(e) => onChange("skewY", e.detail)}
            />
          </div>
        </div>
      {/if}
      {#if typeof $props.data.skewX === "number"}
        <div class="properties">
          <label class="label" for="">Alpha</label>
          <div class="input">
            <NumberInput
              value={$props.data.alpha}
              step={0.01}
              min={0}
              max={1}
              on:change={(e) => onChange("alpha", e.detail)}
            />
          </div>
        </div>
      {/if}
    </section>
  {/if}
{/if}

<style>
  .section {
    background: #3d3d3d;
    border-radius: 2px;
    margin: 8px 4px 2px 8px;
    padding-bottom: 8px;
  }
  .title {
    padding: 4px 16px;
    margin-bottom: 8px;
    user-select: none;
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
  .input {
    margin-right: 16px;
  }
</style>
