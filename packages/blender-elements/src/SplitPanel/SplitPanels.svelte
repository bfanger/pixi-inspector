<script lang="ts">
  import { setContext, type Snippet } from "svelte";
  import throttle from "../throttle";

  type Props = {
    direction: "row" | "column";
    children: Snippet;
    onResize?: (size: { width: number; height: number }) => void;
  };
  let { direction, children, onResize }: Props = $props();
  let dragFrom = $state<number>();
  let clientWidth = $state(0);
  let clientHeight = $state(0);
  let el: HTMLDivElement;

  type PanelData = {
    grow: number;
    el: HTMLDivElement;
    size: number;
    offset: number;
    min: number;
    max: number;
  };
  let pair: [PanelData, PanelData] | undefined;
  setContext("SplitPanel", {
    get direction() {
      return direction;
    },
  });
  let throttledResize = $derived(throttle(150, onResize));

  $effect(() => {
    throttledResize?.({ width: clientWidth, height: clientHeight });
  });

  function dragStart(e: MouseEvent) {
    dragFrom = direction === "row" ? e.clientX : e.clientY;
    pair = undefined;
    let totalGrow = 0;
    let totalSize = 0;
    const panels: PanelData[] = Array.from(el.children)
      .filter((child) => child.classList.contains("split-panel"))
      .map((div) => {
        const el = div as HTMLDivElement;
        const bounds = el.getBoundingClientRect();
        const grow = parseFloat(el.style.flexGrow);
        const size = direction === "row" ? bounds.width : bounds.height;
        totalGrow += grow;
        totalSize += size;
        const panel: PanelData = {
          grow,
          el,
          size,
          offset: direction === "row" ? bounds.left : bounds.top,
          min:
            direction === "row"
              ? parseFloat(el.style.minWidth) || 0
              : parseFloat(el.style.minHeight) || 0,
          max:
            direction === "row"
              ? parseFloat(el.style.maxWidth)
              : parseFloat(el.style.maxHeight),
        };
        return panel;
      });

    if (panels.length < 2) {
      return;
    }

    for (const panel of panels) {
      panel.el.style.flexGrow = `${(panel.size / totalSize) * totalGrow}`;
    }
    if (panels.length === 2) {
      pair = [panels[0], panels[1]];
    } else {
      for (let i = 1; i < panels.length; i++) {
        const panel = panels[i];
        if (Math.ceil(panel.size + panel.offset) > dragFrom) {
          pair = [panels[i - 1], panel];
          break;
        }
      }
    }
    if (!pair) {
      console.warn("Unable to detect which panels to resize");
      return;
    }
  }

  function drag(e: MouseEvent) {
    if (!dragFrom || !pair) {
      return;
    }

    let distance = (direction === "row" ? e.clientX : e.clientY) - dragFrom;

    if (distance > 0) {
      if (distance > pair[1].size - pair[1].min) {
        distance = pair[1].size - pair[1].min;
      }
      if (pair[0].max > 0) {
        if (pair[0].size + distance > pair[0].max) {
          distance = pair[0].max - pair[0].size;
        }
      }
    } else {
      if (pair[0].size + distance < pair[0].min) {
        distance = -pair[0].size + pair[0].min;
      }
      if (pair[1].max > 0) {
        if (distance * -1 + pair[1].size > pair[1].max) {
          distance = pair[1].size - pair[1].max;
        }
      }
    }
    const totalSize = pair[0].size + pair[1].size;
    const totalGrow = pair[0].grow + pair[1].grow;

    const grow = (distance / totalSize) * totalGrow;
    pair[0].el.style.flexGrow = `${pair[0].grow + grow}`;
    pair[1].el.style.flexGrow = `${pair[1].grow - grow}`;
  }

  function dragEnd() {
    dragFrom = undefined;
  }
</script>

<svelte:window onmouseup={dragEnd} />

<div bind:this={el} class="split-panels" style:flex-direction={direction}>
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="divider-area"
    class:dragging={dragFrom}
    style:cursor={direction === "column" ? "row-resize" : "col-resize"}
    onmousedown={dragStart}
    onmousemove={drag}
    bind:clientWidth
    bind:clientHeight
  ></div>
  {@render children()}
</div>

<style>
  .split-panels {
    position: relative;

    display: flex;
    flex-wrap: nowrap;
    gap: 3px;

    width: 100%;
    height: 100%;
  }

  .divider-area {
    position: absolute;
    inset: 1px;

    border: 0;

    appearance: none;
    background: transparent;

    &.dragging {
      z-index: 1;
    }
  }
</style>
