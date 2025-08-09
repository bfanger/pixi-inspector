<script lang="ts">
  import { untrack, type Snippet } from "svelte";

  type Props = {
    size?: number;
    children: Snippet;
  };
  let { size, children }: Props = $props();
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

<div class="split-panel" {@attach sizeAction}>
  {@render children()}
</div>

<style>
  .split-panel {
    pointer-events: none;
    cursor: default;

    position: relative;

    overflow: auto;
    flex-basis: 0;
    flex-grow: 1;

    border: 1px solid #3c3c3c;
    border-radius: 4px;

    :global(> *) {
      pointer-events: auto;
    }
  }
</style>
