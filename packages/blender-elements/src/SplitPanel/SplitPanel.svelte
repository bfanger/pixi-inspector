<script lang="ts">
  import { getContext, untrack, type Snippet } from "svelte";

  type Props = {
    size?: number;
    minWidth?: number;
    minHeight?: number;
    maxWidth?: number;
    maxHeight?: number;
    children: Snippet;
  };
  let {
    size,
    minWidth = 3,
    minHeight = 3,
    maxWidth,
    maxHeight,
    children,
  }: Props = $props();
  let sizeOrDefault = $derived(size ?? 1);

  const ctx = getContext<{ direction: "row" | "column" }>("SplitPanel");
  if (!ctx) {
    console.warn("SplitPanel must be used within a SplitPanels component.");
  }
  let { direction } = $derived(ctx);

  function sizeAction(el: HTMLDivElement) {
    let from = untrack(() => sizeOrDefault);
    el.style.flexGrow = `${sizeOrDefault}`;
    $effect(() => {
      if (from !== sizeOrDefault) {
        from = sizeOrDefault;
        el.style.flexGrow = `${parseFloat(el.style.flexGrow) * (sizeOrDefault / from)}`;
      }
    });
  }
</script>

<div
  class="split-panel"
  style:min-width={direction === "row" && minWidth
    ? `${minWidth}px`
    : undefined}
  style:min-height={direction === "column" && minHeight
    ? `${minHeight}px`
    : undefined}
  style:max-width={direction === "row" && maxWidth
    ? `${maxWidth}px`
    : undefined}
  style:max-height={direction === "column" && maxHeight
    ? `${maxHeight}px`
    : undefined}
  {@attach sizeAction}
>
  {@render children()}
</div>

<style>
  .split-panel {
    cursor: default;
    position: relative;
    flex-basis: 0;
    flex-grow: 1;
  }
</style>
