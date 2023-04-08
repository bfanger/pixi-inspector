<script lang="ts">
  import NumberInput from "blender-elements/src/NumberInput/NumberInput.svelte";
  import { getBridgeContext, poll } from "./bridge-fns";
  import type { PropertyTab, PropertyTabState } from "./types";
  import Panel from "blender-elements/src/Panel/Panel.svelte";
  import Checkbox from "blender-elements/src/Checkbox/Checkbox.svelte";
  import Tabs from "blender-elements/src/Tabs/Tabs.svelte";

  const bridge = getBridgeContext();

  const state = poll<PropertyTabState>(
    bridge,
    "__PIXI_DEVTOOLS__.properties.values()",
    300
  );
  export const refresh = state.sync;

  type Tab = {
    group: PropertyTab;
    icon: string;
    label: string;
  };
  const availableTabs: Tab[] = [
    { group: "scene", icon: "scene", label: "Scene Properties" },
    { group: "object", icon: "object", label: "Object Properties" },
  ];

  $: props = $state.data?.properties ?? {};
  $: tabs = availableTabs.filter((tab) =>
    $state.data?.tabs?.includes(tab.group)
  );
  $: active = availableTabs.find((tab) => tab.group === $state.data?.active);

  $: transformPanel =
    typeof props.x === "number" ||
    typeof props.angle === "number" ||
    typeof props.scaleX === "number";

  let transformSkewDimensions = "";
  $: if (typeof props.width === "number" && typeof props.skewX === "number") {
    transformSkewDimensions = "Skew & Dimensions";
  } else if (typeof props.width === "number") {
    transformSkewDimensions = "Dimensions";
  } else if (typeof props.skewX === "number") {
    transformSkewDimensions = "Skew";
  }

  $: transformOriginPanel =
    typeof props.originX === "number" ||
    typeof props.anchorX === "number" ||
    typeof props.pivotX === "number";

  $: visibilityPanel =
    typeof props.alpha === "number" || typeof props.visible === "boolean";

  $: tickerPanel = typeof props.speed === "number";

  async function onChange(prop: string, value: number | boolean) {
    await bridge(
      `__PIXI_DEVTOOLS__.properties.set(${JSON.stringify(
        prop
      )}, ${JSON.stringify(value)})`
    );
    state.sync();
  }

  async function activateTab(group: PropertyTab) {
    await bridge(
      `__PIXI_DEVTOOLS__.properties.activate(${JSON.stringify(group)})`
    );
    state.sync();
  }

  function onActivate(tab: Tab) {
    activateTab(tab.group);
  }
</script>

<Tabs {tabs} {active} on:activate={(e) => onActivate(e.detail)}>
  {#if props}
    <div class="panels">
      {#if transformPanel}
        <Panel title="Transform">
          <div class="properties">
            <label class="label" for="">Location X</label>
            <NumberInput
              value={props.x}
              step={1}
              location="TOP"
              on:change={(e) => onChange("x", e.detail)}
            />
            <label class="label" for="">Y</label>
            <NumberInput
              value={props.y}
              step={1}
              location="BOTTOM"
              on:change={(e) => onChange("y", e.detail)}
            />
          </div>
          {#if typeof props.angle === "number"}
            <div class="properties">
              <label class="label" for="">Angle</label>
              <NumberInput
                value={props.angle}
                step={1}
                suffix="°"
                on:change={(e) => onChange("angle", e.detail)}
              />
            </div>
          {/if}
          {#if typeof props.scaleX === "number"}
            <div class="properties">
              <label class="label" for="">Scale X</label>
              <NumberInput
                value={props.scaleX}
                step={0.05}
                location="TOP"
                on:change={(e) => onChange("scaleX", e.detail)}
              />
              <label class="label" for="">Y</label>
              <NumberInput
                value={props.scaleY}
                step={0.1}
                location="BOTTOM"
                on:change={(e) => onChange("scaleY", e.detail)}
              />
            </div>
          {/if}
        </Panel>
      {/if}
      {#if transformOriginPanel}
        <Panel title="Transform Origin">
          {#if typeof props.anchorX === "number"}
            <div class="properties">
              <label class="label" for="">Anchor X</label>
              <NumberInput
                value={props.anchorX}
                step={0.01}
                min={0}
                max={1}
                location="TOP"
                on:change={(e) => onChange("anchorX", e.detail)}
              />
              <label class="label" for="">Y</label>
              <NumberInput
                value={props.anchorY}
                step={0.01}
                min={0}
                max={1}
                location="BOTTOM"
                on:change={(e) => onChange("anchorY", e.detail)}
              />
            </div>
          {/if}
          {#if typeof props.originX === "number"}
            <div class="properties">
              <label class="label" for="">Origin X</label>
              <NumberInput
                value={props.originX}
                step={0.01}
                min={0}
                max={1}
                location="TOP"
                on:change={(e) => onChange("originX", e.detail)}
              />
              <label class="label" for="">Y</label>
              <NumberInput
                value={props.originY}
                step={0.01}
                min={0}
                max={1}
                location="BOTTOM"
                on:change={(e) => onChange("originY", e.detail)}
              />
            </div>
          {/if}
          {#if typeof props.pivotX === "number"}
            <div class="properties">
              <label class="label" for="">Pivot X</label>
              <NumberInput
                value={props.pivotX}
                step={0.1}
                location="TOP"
                on:change={(e) => onChange("pivotX", e.detail)}
              />
              <label class="label" for="">Y</label>
              <NumberInput
                value={props.pivotY}
                step={0.1}
                location="BOTTOM"
                on:change={(e) => onChange("pivotY", e.detail)}
              />
            </div>
          {/if}
        </Panel>
      {/if}
      {#if visibilityPanel}
        <Panel title="Visibility">
          {#if typeof props.alpha === "number"}
            <div class="properties">
              <label class="label" for="">Alpha</label>
              <NumberInput
                value={props.alpha}
                step={0.01}
                min={0}
                max={1}
                on:change={(e) => onChange("alpha", e.detail)}
              />
            </div>
          {/if}
          {#if typeof props.visible === "boolean"}
            <div class="properties">
              <div class="label" />
              <Checkbox
                value={props.visible}
                on:toggle={(e) => onChange("visible", e.detail)}
              >
                Visible
              </Checkbox>
            </div>
          {/if}
        </Panel>
      {/if}
      {#if transformSkewDimensions}
        <Panel title={transformSkewDimensions}>
          {#if typeof props.skewX === "number"}
            <div class="properties">
              <label class="label" for="">Skew X</label>
              <NumberInput
                value={props.skewX}
                step={0.01}
                suffix="r"
                location="TOP"
                on:change={(e) => onChange("skewX", e.detail)}
              />
              <label class="label" for="">Y</label>
              <NumberInput
                value={props.skewY}
                step={0.01}
                suffix="r"
                location="BOTTOM"
                on:change={(e) => onChange("skewY", e.detail)}
              />
            </div>
          {/if}
          {#if typeof props.width === "number"}
            <div class="properties">
              <label class="label" for="">Width</label>
              <NumberInput
                value={props.width}
                step={1}
                location="TOP"
                on:change={(e) => onChange("width", e.detail)}
              />
              <label class="label" for="">Height</label>
              <NumberInput
                value={props.height}
                step={1}
                location="BOTTOM"
                on:change={(e) => onChange("height", e.detail)}
              />
            </div>
          {/if}
        </Panel>
      {/if}

      {#if tickerPanel}
        <Panel title="Ticker">
          {#if typeof props.speed === "number"}
            <div class="properties">
              <label class="label" for="">Speed</label>
              <NumberInput
                value={props.speed}
                step={0.01}
                on:change={(e) => onChange("speed", e.detail)}
              />
            </div>
          {/if}
          {#if typeof props.paused === "boolean"}
            <div class="properties">
              <div class="label" />
              <Checkbox
                value={props.paused}
                on:toggle={(e) => onChange("paused", e.detail)}
              >
                Paused
              </Checkbox>
            </div>
          {/if}
        </Panel>
      {/if}
    </div>
  {/if}
</Tabs>

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
