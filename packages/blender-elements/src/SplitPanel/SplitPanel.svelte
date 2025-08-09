<script lang="ts">
  import { getContext, untrack, type Snippet } from "svelte";

  type Props = {
    size?: number;
    min?: number;
    children: Snippet;
  };
  let { size, min = 3, children }: Props = $props();
  let sizeOrDefault = $derived(size ?? 1);
  const ctx = getContext<{ direction: "row" | "column" }>("SplitPanel");

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
  style:min-width={ctx.direction === "row" ? `${min}px` : undefined}
  style:min-height={ctx.direction === "column" ? `${min}px` : undefined}
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
