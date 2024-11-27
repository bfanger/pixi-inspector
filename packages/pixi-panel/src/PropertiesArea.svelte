<script lang="ts">
  import Tabs from "blender-elements/src/Tabs/Tabs.svelte";
  import type { PropertyTab, PropertyTabState } from "./types";
  import { getBridgeContext, poll } from "./bridge-fns";
  import ObjectProperties from "./ObjectProperties.svelte";
  import SceneProperties from "./SceneProperties.svelte";
  import TextProperties from "./TextProperties.svelte";

  const bridge = getBridgeContext();

  const tabState = poll<PropertyTabState>(
    bridge,
    "__PIXI_INSPECTOR__.properties.values()",
    300,
  );
  type Props = {
    refresh: () => void;
  };
  let { refresh = $bindable() }: Props = $props();
  refresh = tabState.sync;

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

  let values = $derived($tabState.data?.properties ?? {});
  let tabs = $derived(
    availableTabs.filter((tab) => $tabState.data?.tabs.includes(tab.group)),
  );
  let active = $derived(
    availableTabs.find((tab) => tab.group === $tabState.data?.active),
  );

  let expanded = $state({
    ticker: true,
    transform: true,
    transformOrigin: true,
    skewDimensions: true,
    visibility: true,
    rendering: true,
    interactive: true,
    font: true,
    alignment: true,
    spacing: true,
    wordWrap: true,
    dropShadow: true,
    stroke: true,
  });

  async function onChange(
    prop: string,
    value: number | string | boolean | undefined,
  ) {
    await bridge(
      `__PIXI_INSPECTOR__.properties.set(${JSON.stringify(
        prop,
      )}, ${JSON.stringify(value)})`,
    );
    tabState.sync();
  }

  async function activateTab(group: PropertyTab) {
    await bridge(
      `__PIXI_INSPECTOR__.properties.activate(${JSON.stringify(group)})`,
    );
    tabState.sync();
  }

  function onActivate(tab: Tab) {
    activateTab(tab.group);
  }
</script>

<Tabs {tabs} {active} onactivate={(tab: any) => onActivate(tab)}>
  {#if values}
    <div class="panels">
      {#if active?.group === "scene"}
        <SceneProperties
          props={values}
          bind:expanded
          onchange={(e) => onChange(e.property, e.value)}
        />
      {:else if active?.group === "object"}
        <ObjectProperties
          props={values}
          bind:expanded
          onchange={(e) => onChange(e.property, e.value)}
        />
      {:else if active?.group === "text"}
        <TextProperties
          props={values}
          bind:expanded
          onchange={(e) => onChange(e.property, e.value)}
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
