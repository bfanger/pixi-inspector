<script lang="ts">
  import Tree from "./Tree.svelte";
  import OutlinerRow from "blender-elements/src/OutlinerRow.svelte";
  import { createEventDispatcher } from "svelte";
  import type { OutlinerNode } from "./types";

  type Props = {
    id: string;
    name: string;
    leaf: boolean;
    active: boolean;
    selectable: boolean;
    visible: boolean | undefined;
    match: boolean | undefined;
    muted?: boolean;
    parentUnselectable?: boolean | undefined;
    children?: OutlinerNode[] | undefined;
    depth?: number;
  };

  let {
    id,
    name,
    leaf,
    active,
    selectable,
    visible,
    match,
    muted = false,
    parentUnselectable = undefined,
    children = undefined,
    depth = 0,
  }: Props = $props();

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
    <Tree
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
