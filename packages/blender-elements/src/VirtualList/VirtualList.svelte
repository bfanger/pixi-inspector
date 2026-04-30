<script lang="ts">
  import type { Snippet } from "svelte";

  type Props = {
    /** Total number of items in the list */
    total: number;
    /** Height in pixels of a single item */
    itemSize: number;
    /** Buffer in pixels for additional rendering outside the visible area */
    buffer: number;
    /** Determines the background pattern */
    variant: "striped";
    /** Callback to request items based on the visible viewport */
    render: (offset: number, count: number) => void;
    /** The visible items + buffer */
    [slot: `slot${number}`]: Snippet;
    /** Slot and position for the items, in DOM order */
    value: { slot: `slot${number}`; offset: number }[];
  };

  let { total, itemSize, value, variant, buffer, render, ...rest }: Props =
    $props();

  let previousOffset = 0;
  let previousCount = 0;

  function recalculate(el: HTMLDivElement) {
    const offset = Math.max(
      0,
      Math.min(Math.floor((el.scrollTop - buffer) / itemSize), total - 1),
    );
    const count = Math.min(
      Math.ceil((el.clientHeight + buffer * 2) / itemSize),
      total - offset,
    );
    if (offset !== previousOffset || count !== previousCount) {
      previousOffset = offset;
      previousCount = count;
      render(offset, count);
    }
  }

  function mount(el: HTMLDivElement) {
    recalculate(el);
    const observer = new ResizeObserver(() => {
      recalculate(el);
    });
    observer.observe(el);
    return () => {
      observer.disconnect();
    };
  }
</script>

<div
  class="virtual-list"
  onscroll={(e) => recalculate(e.currentTarget)}
  {@attach mount}
>
  <div
    class="container"
    data-variant={variant}
    style:height="{itemSize * total}px"
    style:background-size={variant === "striped"
      ? `100% ${itemSize * 2}px`
      : undefined}
  >
    {#each value as { slot, offset } (slot)}
      <div class="rendered-items" style:top="{offset * itemSize}px">
        {@render rest[slot]()}
      </div>
    {/each}
  </div>
</div>

<style>
  .virtual-list {
    overflow-y: auto;
    flex: 1;
    height: 100%;
  }

  .container {
    position: relative;

    &[data-variant="striped"] {
      min-height: 100%;
      background-image: linear-gradient(
        to bottom,
        #282828 50%,
        #2b2b2b 50%,
        #2b2b2b
      );
    }
  }

  .rendered-items {
    position: absolute;
    left: 0;
    overflow-x: hidden;
    width: 100%;
  }
</style>
