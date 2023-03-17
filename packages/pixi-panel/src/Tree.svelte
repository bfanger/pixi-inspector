<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import OutlinerRow from "blender-elements/OutlinerRow.svelte";
  import type { OutlinerNode } from "./types";

  export let id: string;
  export let name: string;
  export let leaf: boolean;
  export let active: boolean;
  export let visible: boolean | undefined;
  export let match: boolean | undefined;
  export let muted = false;
  export let children: OutlinerNode[] | undefined = undefined;
  export let depth = 0;

  const dispatch = createEventDispatcher();
</script>

<OutlinerRow
  indent={depth}
  title={name}
  {active}
  {visible}
  {match}
  muted={visible === false || muted}
  expanded={leaf ? undefined : !!children}
  on:expand={() => dispatch("expand", [id])}
  on:collapse={() => dispatch("collapse", [id])}
  on:activate={() => dispatch("activate", [id])}
  on:show={() => dispatch("show", [id])}
  on:hide={() => dispatch("hide", [id])}
  on:log={() => dispatch("log", [id])}
/>

{#if children}
  {#each children as child}
    <svelte:self
      id={child.id}
      name={child.name}
      leaf={child.leaf}
      active={child.active}
      visible={child.visible}
      match={child.match}
      muted={visible === false || muted}
      children={child.children}
      depth={depth + 1}
      on:expand={({ detail }) => dispatch("expand", [id, ...detail])}
      on:collapse={({ detail }) => dispatch("collapse", [id, ...detail])}
      on:activate={({ detail }) => dispatch("activate", [id, ...detail])}
      on:show={({ detail }) => dispatch("show", [id, ...detail])}
      on:hide={({ detail }) => dispatch("hide", [id, ...detail])}
      on:log={({ detail }) => dispatch("log", [id, ...detail])}
    />
  {/each}
{/if}
