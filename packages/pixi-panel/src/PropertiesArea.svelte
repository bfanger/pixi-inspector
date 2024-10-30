<script lang="ts">
  import Tabs from "blender-elements/src/Tabs/Tabs.svelte";
  import type { PropertyTab, PropertyTabState } from "./types";
  import { getBridgeContext, poll } from "./bridge-fns";
  import ObjectProperties from "./ObjectProperties.svelte";
  import SceneProperties from "./SceneProperties.svelte";
  import TextProperties from "./TextProperties.svelte";

  const bridge = getBridgeContext();

  const state = poll<PropertyTabState>(
    bridge,
    "__PIXI_DEVTOOLS__.properties.values()",
    300,
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
    { group: "text", icon: "text", label: "Text Properties" },
  ];

  $: props = $state.data?.properties ?? {};
  $: tabs = availableTabs.filter((tab) =>
    $state.data?.tabs.includes(tab.group),
  );
  $: active = availableTabs.find((tab) => tab.group === $state.data?.active);

  let expanded = {
    ticker: true,
    transform: true,
    transformOrigin: true,
    skewDimensions: true,
    visibility: true,
    rendering: true,
    interactive: true,
    font: true,
    alignment: true,
    spacer: true,
    wordWrap: true,
    dropShadow: true,
    stroke: true,
  };

  async function onChange(prop: string, value: number | boolean) {
    await bridge(
      `__PIXI_DEVTOOLS__.properties.set(${JSON.stringify(
        prop,
      )}, ${JSON.stringify(value)})`,
    );
    state.sync();
  }

  async function activateTab(group: PropertyTab) {
    await bridge(
      `__PIXI_DEVTOOLS__.properties.activate(${JSON.stringify(group)})`,
    );
    state.sync();
  }

  function onActivate(tab: Tab) {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    activateTab(tab.group);
  }
</script>

<Tabs {tabs} {active} on:activate={(e) => onActivate(e.detail)}>
  {#if props}
    <div class="panels">
      {#if active?.group === "scene"}
        <SceneProperties
          {props}
          bind:expanded
          on:change={(e) => onChange(e.detail.property, e.detail.value)}
        />
      {:else if active?.group === "object"}
        <ObjectProperties
          {props}
          bind:expanded
          on:change={(e) => onChange(e.detail.property, e.detail.value)}
        />
      {:else if active?.group === "text"}
        <TextProperties
          {props}
          bind:expanded
          on:change={(e) => onChange(e.detail.property, e.detail.value)}
        />
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
</style>
