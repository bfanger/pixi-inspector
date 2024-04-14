<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import OutlinerRow from "blender-elements/src/OutlinerRow.svelte";
  import type { OutlinerNode } from "./types";

  export let id: string;
  export let name: string;
  export let leaf: boolean;
  export let active: boolean;
  export let selectable: boolean;
  export let visible: boolean | undefined;
  export let match: boolean | undefined;
  export let muted = false;
  export let parentUnselectable: boolean | undefined = undefined;
  export let children: OutlinerNode[] | undefined = undefined;
  export let depth = 0;

  const dispatch = createEventDispatcher();
</script>

<OutlinerRow
  indent={depth}
  title={name}
  {active}
  {selectable}
  {visible}
  {match}
  muted={visible === false || muted}
  parentUnselectable={parentUnselectable || !selectable}
  expanded={leaf ? undefined : !!children}
  on:expand={() => dispatch("expand", [id])}
  on:collapse={() => dispatch("collapse", [id])}
  on:activate={() => dispatch("activate", [id])}
  on:selectable={() => dispatch("selectable", [id])}
  on:unselectable={() => dispatch("unselectable", [id])}
  on:show={() => dispatch("show", [id])}
  on:hide={() => dispatch("hide", [id])}
  on:log={() => dispatch("log", [id])}
  on:mouseenter={() => dispatch("mouseenter", [id])}
  on:mouseleave={() => dispatch("mouseleave", [id])}
/>

{#if children}
  {#each children as child}
    <svelte:self
      id={child.id}
      name={child.name}
      leaf={child.leaf}
      active={child.active}
      selectable={child.selectable}
      parentUnselectable={parentUnselectable || !selectable}
      visible={child.visible}
      match={child.match}
      muted={visible === false || muted}
      children={child.children}
      depth={depth + 1}
      on:expand={({ detail }) => dispatch("expand", [id, ...detail])}
      on:collapse={({ detail }) => dispatch("collapse", [id, ...detail])}
      on:activate={({ detail }) => dispatch("activate", [id, ...detail])}
      on:selectable={({ detail }) => dispatch("selectable", [id, ...detail])}
      on:unselectable={({ detail }) =>
        dispatch("unselectable", [id, ...detail])}
      on:show={({ detail }) => dispatch("show", [id, ...detail])}
      on:hide={({ detail }) => dispatch("hide", [id, ...detail])}
      on:log={({ detail }) => dispatch("log", [id, ...detail])}
      on:mouseenter={({ detail }) => dispatch("mouseenter", [id, ...detail])}
      on:mouseleave={({ detail }) => dispatch("mouseleave", [id, ...detail])}
    />
  {/each}
{/if}
