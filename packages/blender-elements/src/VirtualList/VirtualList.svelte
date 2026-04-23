<script lang="ts">
  import type { Snippet } from "svelte";

  type Props = {
    /** Total number of items in the list */
    total: number;
    /** Height in pixels of a single item  */
    size: number;
    /** The parent component provides all items as a single children snippet. */
    children: Snippet;
    /** Starting index of the currently rendered items (used for positioning) */
    value: number;
    /** Buffer in pixels for additional rendering outside the visible area */
    buffer: number;
    /** Determines the background pattern */
    variant: "striped";
    /** Callback to request items based on the visible viewport */
    render: (offset: number, count: number) => void;
  };

  let { total, size, value, variant, buffer, render, children }: Props =
    $props();

  let previousOffset = 0;
  let previousCount = 0;

  function recalculate(el: HTMLDivElement) {
    const offset = Math.max(
      0,
      Math.min(Math.floor((el.scrollTop - buffer) / size), total - 1),
    );
    const count = Math.min(
      Math.ceil((el.clientHeight + buffer * 2) / size) + 1,
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
    style:height="{size * total}px"
    style:background-size={variant === "striped"
      ? `100% ${size * 2}px`
      : undefined}
  >
    <div class="rendered-items" style:top="{value * size}px">
      {@render children()}
    </div>
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
