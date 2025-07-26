<script lang="ts" generics="T extends { icon: string; label: string }">
  import type { Snippet } from "svelte";

  type Props<T> = {
    tabs: T[];
    active: T | undefined;
    children?: Snippet;
    onactivate?: (tab: T) => void;
  };

  let { tabs, active, children, onactivate }: Props<T> = $props();
</script>

<div class="tab-layout">
  <div class="tabs">
    {#each tabs as tab (tab)}
      <button
        class="tab"
        class:active={tab === active}
        title={tab.label}
        aria-label={tab.label}
        onclick={() => onactivate?.(tab)}
      >
        <div class="icon" style:background-image="var(--icon-{tab.icon})"></div>
      </button>
    {/each}
  </div>
  <div class="content">{@render children?.()}</div>
</div>

<style>
  .tab-layout {
    display: flex;
    height: 100%;
  }

  .tabs {
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    gap: 2px;

    padding-top: 8px;
    padding-left: 2px;

    background: #181818;
  }

  .tab {
    cursor: pointer;

    position: relative;

    box-sizing: border-box;
    width: 26px;
    height: 26px;
    border: 0;
    border: 1px solid transparent;
    border-top-left-radius: 4px;
    border-bottom-left-radius: 4px;

    appearance: none;
    background: transparent;
    outline: none;

    &:hover {
      background-color: #202020;
    }

    &.active {
      background-color: #303030;
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

    opacity: 0.8;
    background: center center no-repeat;
  }

  .active .icon,
  .tab:hover .icon {
    opacity: 1;
  }

  .content {
    overflow-y: auto;
    flex-grow: 1;
    background: #303030;
  }
</style>
