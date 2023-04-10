<script lang="ts">
  import { slide } from "svelte/transition";
  import Checkbox from "../Checkbox/Checkbox.svelte";
  import { createEventDispatcher } from "svelte";

  export let title: string;
  export let expanded = true;
  export let value: boolean | undefined = undefined;

  const dispatch = createEventDispatcher();

  function onToggleExpanded() {
    expanded = !expanded;
  }
</script>

<section class="panel">
  <button class="title" class:expanded on:click={onToggleExpanded}>
    {#if typeof value === "boolean"}
      <Checkbox bind:value on:change={(e) => dispatch("change", e.detail)} />
    {/if}
    <span>{title}</span>
  </button>
  {#if expanded}
    <div
      class="content"
      class:disabled={value === false}
      transition:slide|local={{ duration: 150 }}
    >
      <slot />
    </div>
  {/if}
</section>

<style lang="scss">
  .panel {
    background: #353535;
    border-radius: 4px;
  }
  .title {
    display: flex;
    gap: 4px;
    appearance: none;
    position: relative;
    background: transparent;
    border: 0;
    color: inherit;
    box-sizing: border-box;
    padding: 4px 16px 4px 20px;
    min-height: 24px;
    width: 100%;
    user-select: none;
    text-align: left;

    &:before {
      content: "";
      position: absolute;
      top: 3px;
      left: 3px;
      width: 16px;
      height: 16px;
      background: var(--icon-chevron-right) center center no-repeat;
      opacity: 0.5;
    }
    &.expanded::before {
      background-image: var(--icon-chevron-down);
    }
  }
  .content {
    padding: 8px;
    &.disabled {
      opacity: 0.5;
    }
  }
</style>
