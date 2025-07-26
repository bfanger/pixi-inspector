<script lang="ts">
  import Tabs from "../../../../blender-elements/src/Tabs/Tabs.svelte";
  import ObjectProperties from "../../../../pixi-panel/src/ObjectProperties.svelte";
  import SceneProperties from "../../../../pixi-panel/src/SceneProperties.svelte";
  import TextProperties from "../../../../pixi-panel/src/TextProperties.svelte";
  import type {
    PropertyTab,
    PropertyTabState,
  } from "../../../../pixi-panel/src/types";
  import type { TreeValue } from "../../types";

  type Props = {
    value: PropertyTabState;
    setValue: (update: { property: string; value: TreeValue }) => void;
    onactivate: (tab: PropertyTab) => void;
  };
  let { value, setValue, onactivate }: Props = $props();
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
  let tabs = $derived(
    availableTabs.filter((tab) => value.tabs.includes(tab.group)),
  );
  let active = $derived(
    availableTabs.find((tab) => tab.group === value.active),
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
</script>

<Tabs {active} {tabs} onactivate={(tab) => onactivate(tab.group)}>
  {#if value.properties}
    {#if active?.group === "scene"}
      <SceneProperties
        props={value.properties}
        bind:expanded
        onchange={setValue}
      />
    {:else if active?.group === "object"}
      <ObjectProperties
        props={value.properties}
        bind:expanded
        onchange={setValue}
      />
    {:else if active?.group === "text"}
      <TextProperties
        props={value.properties}
        bind:expanded
        onchange={setValue}
      />
    {/if}
  {/if}
</Tabs>
