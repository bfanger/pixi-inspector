<script lang="ts">
  import { type Snippet } from "svelte";

  type Props = {
    direction: "row" | "column";
    children: Snippet;
  };
  let { direction, children }: Props = $props();
  let dragFrom = $state<number>();
  let el: HTMLDivElement;

  type PanelData = {
    grow: number;
    el: HTMLDivElement;
    size: number;
    offset: number;
    min: number;
  };
  let pair: [PanelData, PanelData] | undefined;

  function dragStart(e: MouseEvent) {
    dragFrom = direction === "row" ? e.clientX : e.clientY;
    pair = undefined;
    const panels: PanelData[] = Array.from(el.children)
      .filter((child) => child.classList.contains("split-panel"))
      .map((div) => {
        const el = div as HTMLDivElement;
        const bounds = el.getBoundingClientRect();

        const panel: PanelData = {
          grow: parseFloat(el.style.flexGrow),
          el,
          size: direction === "row" ? bounds.width : bounds.height,
          offset: direction === "row" ? bounds.left : bounds.top,
          min:
            direction === "row"
              ? parseFloat(el.style.minWidth)
              : parseFloat(el.style.minHeight),
        };
        return panel;
      });

    if (panels.length < 2) {
      return;
    } else if (panels.length === 2) {
      pair = [panels[0], panels[1]];
    } else {
      for (let i = 1; i < panels.length; i++) {
        const panel = panels[i];
        if (panel.size + panel.offset > dragFrom) {
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
    } else {
      if (pair[0].size + distance < pair[0].min) {
        distance = -pair[0].size + pair[0].min;
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
  ></div>
  {@render children()}
</div>

<style>
  .split-panels {
    position: relative;

    overflow: auto;
    display: flex;
    gap: 3px;

    min-height: 100%;
  }

  .divider-area {
    cursor: move;

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
