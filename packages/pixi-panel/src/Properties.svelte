<script lang="ts">
  import NumberInput from "blender-elements/NumberInput.svelte";
  import { getBridgeContext, poll } from "./bridge-fns";
  import type { NodeProperties } from "./types";

  const bridge = getBridgeContext();

  const props = poll<NodeProperties>(
    bridge,
    "__PIXI_DEVTOOLS__.properties.getAll()",
    1000
  );
  export const refresh = props.sync;

  function onChange(prop: string, value: number) {
    bridge(
      `__PIXI_DEVTOOLS__.properties.set(${JSON.stringify(prop)}, ${value})`
    );
    props.sync();
  }
</script>

{#if $props.data}
  <section class="section">
    <div class="title">Transform</div>
    <div class="properties">
      <label class="label" for="">Location X</label>
      <div class="input">
        <NumberInput
          value={$props.data.x}
          location="TOP"
          on:change={(e) => onChange("x", e.detail)}
        />
      </div>
      <label class="label" for="">Y</label>
      <div class="input">
        <NumberInput
          value={$props.data.y}
          location="BOTTOM"
          on:change={(e) => onChange("y", e.detail)}
        />
      </div>
    </div>
    <div class="properties">
      <label class="label" for="">Rotation</label>
      <div class="input">
        <NumberInput
          value={$props.data.rotation}
          on:change={(e) => onChange("rotation", e.detail)}
        />
      </div>
    </div>
    <div class="properties">
      <label class="label" for="">Scale X</label>
      <div class="input">
        <NumberInput value={$props.data.scaleX} location="TOP" />
      </div>
      <label class="label" for="">Y</label>
      <div class="input">
        <NumberInput value={$props.data.scaleY} location="BOTTOM" />
      </div>
    </div>
  </section>
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
  }
  .properties {
    display: grid;
    grid-template-columns: 1fr 2fr;
    margin-bottom: 6px;
  }
  .label {
    text-align: right;
    margin-right: 8px;
  }
  .input {
    margin-right: 16px;
  }
</style>
