<script lang="ts">
  import { untrack, type Snippet } from "svelte";

  type Props = {
    size?: number;
    min?: number;
    children: Snippet;
  };
  let { size, min = 3, children }: Props = $props();
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
  style:min-width="{min}px"
  style:min-height="{min}px"
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
