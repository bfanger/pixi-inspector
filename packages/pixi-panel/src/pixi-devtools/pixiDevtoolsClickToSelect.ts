import type { IPointData } from "pixi.js";
import type { PixiDevtools } from "../types";

export default function pixiDevtoolsClickToSelect(devtools: PixiDevtools) {
  let moved = true;

  function onSelectAt(point: IPointData) {
    const $pixi = devtools.active();
    const nodes = devtools.viewport.ray(point, (node) => {
      if ("visible" in node && node.visible === false) {
        return false;
      }
      return true;
    });
    const root = devtools.root();
    if (nodes.length > 1 && nodes[nodes.length - 1] === root) {
      nodes.length -= 1;
    }

    if (moved || nodes.length === 1) {
      moved = false;
      devtools.activate(nodes[0]);
    } else {
      // Cycle through the nodes at this position

      let index = $pixi ? nodes.indexOf($pixi) : -1;
      if (index === -1 || index === nodes.length - 1) {
        index = 0;
      } else if (nodes.length > 1) {
        index += 1;
      }
      devtools.activate(nodes[index]);
    }
  }
  /**
   * Overwrite the default right-click behavior to activate the node at that position
   */
  function onContextMenu(e: MouseEvent) {
    if (e.defaultPrevented) {
      return;
    }
    e.preventDefault();
    const point = devtools.viewport.fromClient(e.clientX, e.clientY);
    onSelectAt(point);
  }

  function onPointerDown(e: PointerEvent) {
    if (e.altKey && !e.ctrlKey && !e.shiftKey && !e.metaKey) {
      const point = devtools.viewport.fromClient(e.clientX, e.clientY);
      onSelectAt(point);
    }
  }
  function onPointerMove() {
    moved = true;
  }

  let previous: HTMLCanvasElement;
  function bindEvents() {
    const canvas = devtools.canvas() as HTMLCanvasElement;
    if (canvas !== previous) {
      if (previous) {
        previous.removeEventListener?.("contextmenu", onContextMenu);
        previous.removeEventListener?.("pointerdown", onPointerDown);
        previous.removeEventListener?.("pointermove", onPointerMove);
      }
      if (canvas) {
        canvas.addEventListener?.("contextmenu", onContextMenu);
        canvas.addEventListener?.("pointerdown", onPointerDown);
        canvas.addEventListener?.("pointermove", onPointerMove);
      }
      previous = canvas;
    }
  }
  bindEvents();
  setInterval(bindEvents, 2500);

  return {};
}
