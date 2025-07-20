<script lang="ts">
  import { slide } from "svelte/transition";
  import Checkbox from "../Checkbox/Checkbox.svelte";

  type Props = {
    title: string;
    expanded?: boolean;
    value?: boolean | undefined;
    setValue?: (value: boolean) => void;
    children?: import("svelte").Snippet;
  };

  let {
    title,
    expanded = $bindable(true),
    value = $bindable(undefined),
    setValue,
    children,
  }: Props = $props();

  function onToggleExpanded() {
    expanded = !expanded;
  }
</script>

<section class="panel">
  <button class="title" class:expanded onclick={onToggleExpanded}>
    {#if typeof value === "boolean"}
      <Checkbox bind:value {setValue} />
    {/if}
    <span>{title}</span>
  </button>
  {#if expanded}
    <div
      class="content"
      class:disabled={value === false}
      transition:slide={{ duration: 150 }}
    >
      {@render children?.()}
    </div>
  {/if}
</section>

<style>
  .panel {
    border-radius: 4px;
    background: #353535;
  }

  .title {
    user-select: none;

    position: relative;

    display: flex;
    gap: 4px;

    box-sizing: border-box;
    width: 100%;
    min-height: 24px;
    padding: 4px 16px 4px 20px;
    border: 0;

    color: inherit;
    text-align: left;

    appearance: none;
    background: transparent;

    &::before {
      content: "";

      position: absolute;
      top: 3px;
      left: 3px;

      width: 16px;
      height: 16px;

      opacity: 0.5;
      background: var(--icon-chevron-right) center center no-repeat;
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
