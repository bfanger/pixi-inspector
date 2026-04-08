<script lang="ts">
  import { slide } from "svelte/transition";
  import CheckboxInput from "../CheckboxInput/CheckboxInput.svelte";
  import type { Snippet } from "svelte";

  type Props = {
    title: string;
    expanded?: boolean;
    value?: boolean | undefined;
    setValue?: (value: boolean) => void;
    setExpanded?: (expanded: boolean) => void;
    children?: Snippet;
  };

  let {
    title,
    expanded = $bindable(true),
    value = $bindable(undefined),
    setValue,
    setExpanded,
    children,
  }: Props = $props();
</script>

<section class="panel">
  <button
    class="title"
    class:expanded
    onclick={() => {
      expanded = !expanded;
      setExpanded?.(expanded);
    }}
  >
    {#if typeof value === "boolean"}
      <CheckboxInput bind:value {setValue} />
    {/if}
    <span>{title}</span>
  </button>
  {#if expanded}
    <div
      class="content"
      class:unused={value === false}
      transition:slide={{ duration: 150 }}
    >
      {@render children?.()}
    </div>
  {/if}
</section>

<style>
  .panel {
    border-radius: 4px;
    background: #3d3d3d;
  }

  .title {
    user-select: none;

    position: relative;

    display: flex;
    gap: 4px;
    align-items: center;

    box-sizing: border-box;
    width: 100%;
    min-height: 24px;
    padding: 4px 16px 4px 20px;
    border: 0;

    font-size: inherit;
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

  .content.unused {
    opacity: 0.5;
  }
</style>
