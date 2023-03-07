import type { PixiDevtools } from "../types";

export default function pixiDevtoolsClickToSelect(devtools: PixiDevtools) {
  /**
   * Overwrite the default right-click behavior to activate the node at that position
   */
  function onContextMenu(e: MouseEvent) {
    if (e.defaultPrevented) {
      return;
    }
    e.preventDefault();
    const point = devtools.viewport.fromClient(e.clientX, e.clientY);
    const node = devtools.viewport.ray(point);
    devtools.activate(node ?? devtools.root());
  }

  function onPointerDown(e: PointerEvent) {
    if (e.altKey && !e.ctrlKey && !e.shiftKey && !e.metaKey) {
      const point = devtools.viewport.fromClient(e.clientX, e.clientY);
      const node = devtools.viewport.ray(point);
      devtools.activate(node ?? devtools.root());
    }
  }
  let previous: HTMLCanvasElement;
  function bindEvents() {
    const canvas = devtools.canvas() as HTMLCanvasElement;
    if (canvas !== previous) {
      if (previous) {
        previous.removeEventListener?.("contextmenu", onContextMenu);
        previous.removeEventListener?.("pointerdown", onPointerDown);
      }
      if (canvas) {
        canvas.addEventListener?.("contextmenu", onContextMenu);
        canvas.addEventListener?.("pointerdown", onPointerDown);
      }
      previous = canvas;
    }
  }
  bindEvents();
  setInterval(bindEvents, 2500);

  return {};
}
