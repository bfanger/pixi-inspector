<script lang="ts">
  import Tabs, { type Tab } from "blender-elements/src/Tabs/Tabs.svelte";
  import ObjectProperties from "./ObjectProperties.svelte";
  import SceneProperties from "./SceneProperties.svelte";
  import TextProperties from "./TextProperties.svelte";
  import type { PropertyTab, PropertyTabState } from "./types";
  import type { TreeValue } from "ui-protocol/src/types";
  import Box from "blender-elements/src/Box/Box.svelte";

  type Props = {
    value: PropertyTabState;
    setValue: (update: { property: string; value: TreeValue }) => void;
    onactivate: (tab: PropertyTab) => void;
  };
  let { value, setValue, onactivate }: Props = $props();

  const availableTabs = {
    scene: { icon: "scene", label: "Scene Properties" },
    object: { icon: "object", label: "Object Properties" },
    text: { icon: "text", label: "Text Properties" },
  } as const;

  let filteredTabs = $derived(
    Object.fromEntries(
      Object.entries(availableTabs).filter(([key]) =>
        value.tabs.includes(key as PropertyTab),
      ),
    ) as Record<PropertyTab, Tab>,
  );
  let expanded = $state({
    ticker: true,
    renderer: true,
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

<Tabs active={value.active} tabs={filteredTabs} {onactivate}>
  {#if value.properties}
    <Box padding="8px" gap="1px">
      {#if value.active === "scene"}
        <SceneProperties
          props={value.properties}
          bind:expanded
          onchange={setValue}
        />
      {:else if value.active === "object"}
        <ObjectProperties
          props={value.properties}
          bind:expanded
          onchange={setValue}
        />
      {:else if value.active === "text"}
        <TextProperties
          props={value.properties}
          bind:expanded
          onchange={setValue}
        />
      {/if}
    </Box>
  {/if}
</Tabs>
