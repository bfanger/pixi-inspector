<script lang="ts" context="module">
  export type Tab = {
    icon: string;
    label: string;
  };
</script>

<script lang="ts">
  import { createEventDispatcher } from "svelte";

  export let tabs: Tab[];
  export let active: Tab | undefined;

  const dispatch = createEventDispatcher();
</script>

<div class="tab-layout">
  <div class="tabs">
    {#each tabs as tab}
      <button
        class="tab"
        class:active={tab === active}
        title={tab.label}
        on:click={() => dispatch("activate", tab)}
      >
        <div class="icon" style:background-image="var(--icon-{tab.icon})" />
      </button>
    {/each}
  </div>
  <div class="content"><slot /></div>
</div>

<style>
  .tab-layout {
    display: flex;
    height: 100%;
  }
  .tabs {
    display: flex;
    flex-shrink: 0;
    flex-direction: column;
    padding-top: 8px;
    padding-left: 2px;
    gap: 2px;
    background: #1b1b1b;
    overflow-y: auto;
  }
  .tab {
    appearance: none;
    position: relative;
    border: 0;
    width: 26px;
    height: 26px;
    background: transparent;
    box-sizing: border-box;
    border: 1px solid transparent;
    border-top-left-radius: 4px;
    border-bottom-left-radius: 4px;
    outline: none;
    cursor: pointer;

    &:hover {
      background-color: #202020;
    }
    &.active {
      background-color: #2a2a2a;
    }
    &:focus-visible {
      border-color: #4772b3;
      border-right-color: transparent;
    }
  }
  .icon {
    position: absolute;
    top: 4px;
    left: 4px;
    width: 16px;
    height: 16px;
    background: center center no-repeat;
    opacity: 0.8;
  }
  .tab:hover .icon,
  .active .icon {
    opacity: 1;
  }
  .content {
    background: #2a2a2a;
    flex-grow: 1;
    overflow-y: auto;
  }
</style>
