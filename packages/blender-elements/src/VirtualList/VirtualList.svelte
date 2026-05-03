<script lang="ts">
  import { untrack, type Snippet } from "svelte";

  type Props = {
    /** Total number of items in the list */
    total: number;
    /** Height in pixels of a single item */
    itemSize: number;
    /** Number of items to render outside the visible area */
    buffer: number;
    /** Determines the background pattern */
    variant: "striped";
    /** Index of the items to scroll to */
    jumpTo?: number;
    /** Callback to request items based on the visible viewport */
    render: (offset: number, count: number) => void;
    /** The visible items + buffer */
    [slot: `slot${number}`]: Snippet;
    /** Slot and position for the items, in DOM order */
    value: { slot: `slot${number}`; offset: number }[];
  };

  let {
    total,
    itemSize,
    value,
    variant,
    buffer,
    jumpTo,
    render,
    ...rest
  }: Props = $props();

  let previousOffset = 0;
  let previousCount = 0;
  function rerender(el: HTMLDivElement) {
    const viewport = calculateViewport(el);
    const offset = Math.max(0, viewport.offset - buffer);
    const count = Math.min(viewport.count + buffer * 2, total - offset);
    if (offset !== previousOffset || count !== previousCount) {
      previousOffset = offset;
      previousCount = count;
      render(offset, count);
    }
  }

  function calculateViewport(el: HTMLDivElement) {
    const offset = Math.max(0, Math.floor(el.scrollTop / itemSize));
    const count = Math.ceil(el.clientHeight / itemSize);
    return { offset, count };
  }

  function resizer(el: HTMLDivElement) {
    rerender(el);
    const observer = new ResizeObserver(() => {
      rerender(el);
    });
    observer.observe(el);
    return () => {
      observer.disconnect();
    };
  }

  function jumper(el: HTMLDivElement) {
    if (jumpTo === undefined) {
      return;
    }
    const viewport = untrack(() => calculateViewport(el));
    if (
      jumpTo > viewport.offset + 2 &&
      jumpTo < viewport.offset + viewport.count - 2
    ) {
      jumpTo = undefined;
      return;
    }
    let target = jumpTo - viewport.count / 2;
    let behavior: ScrollBehavior = "instant";
    if (viewport.count > 4) {
      if (jumpTo > viewport.offset - 1 && jumpTo <= viewport.offset + 2) {
        behavior = "smooth";
        target = jumpTo - 2;
      }
      if (
        jumpTo > viewport.offset + viewport.count - 3 &&
        jumpTo <= viewport.offset + viewport.count
      ) {
        behavior = "smooth";
        target = jumpTo - viewport.count + 3;
      }
    }
    el.scrollTo({ top: target * itemSize, behavior });
    jumpTo = undefined;
  }
</script>

<div
  class="virtual-list"
  onscroll={(e) => rerender(e.currentTarget)}
  {@attach resizer}
  {@attach jumper}
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
