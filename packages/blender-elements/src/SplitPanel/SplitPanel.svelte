<script lang="ts">
  import { untrack, type Snippet } from "svelte";

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
  style:min-width="{minWidth}px"
  style:min-height="{minHeight}px"
  style:max-width={maxWidth ? `${maxWidth}px` : undefined}
  style:max-height={maxHeight ? `${maxHeight}px` : undefined}
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
