<script lang="ts">
  import { slide } from "svelte/transition";
  import CheckboxInput from "../CheckboxInput/CheckboxInput.svelte";
  import type { Snippet } from "svelte";

  type Props = {
    title: string;
    expanded?: boolean;
    setExpanded?: (expanded: boolean) => void;
    value?: boolean | undefined;
    setValue?: (value: boolean) => void;
    /** Called with `true` to request content for the slide-in animation, or `false` when the slide-out animation completes and content is no longer needed */
    setContent?: (content: boolean) => void;
    /** Delay the slide-in animation until true */
    content?: boolean;
    children?: Snippet;
  };

  let {
    title,
    expanded = $bindable(true),
    content = true,
    value = $bindable(undefined),
    setValue,
    setExpanded,
    setContent,
    children,
  }: Props = $props();

  let wanted = $state(expanded);

  $effect(() => {
    if (content) {
      if (wanted && !expanded) {
        expanded = true;
        setExpanded?.(true);
      }
    }
  });
</script>

<section class="panel">
  <button
    class="title"
    class:expanded
    onclick={() => {
      wanted = !expanded;
      if (wanted && !content) {
        setContent?.(true);
      } else {
        expanded = wanted;
        setExpanded?.(expanded);
      }
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
      onoutroend={() => {
        setContent?.(false);
      }}
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
