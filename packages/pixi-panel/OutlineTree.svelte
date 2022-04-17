<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import type { OutlineNode } from "./types";

  export let id: string;
  export let name: string;
  export let leaf: boolean;
  export let active: boolean;
  export let children: OutlineNode[] | undefined = undefined;

  const dispatch = createEventDispatcher();

  function toggle() {
    if (!leaf) {
      if (children === undefined) {
        dispatch("expand", [id]);
      } else {
        dispatch("collapse", [id]);
      }
    }
  }
</script>

<div>
  {#if leaf}
    {name}
  {:else}
    {#if children}
      <button class="arrow" on:click={() => dispatch("collapse", [id])}
        >v</button
      >
    {:else}
      <button class="arrow" on:click={() => dispatch("expand", [id])}
        >&gt;</button
      >
    {/if}
    <button on:click={toggle}>
      {name}
    </button>
  {/if}
  {#if active}(active){/if}

  {#if children}
    {#each children as child}
      <svelte:self
        id={child.id}
        name={child.name}
        leaf={child.leaf}
        active={child.active}
        children={child.children}
        on:expand={({ detail }) => dispatch("expand", [id, ...detail])}
        on:collapse={({ detail }) => dispatch("collapse", [id, ...detail])}
      />
    {/each}
  {/if}
</div>

<style>
  .arrow {
    appearance: none;
    font-size: 12px;
    /* padding: 0; */
    border: 0;
    width: 16px;
    height: 16px;
  }
</style>
