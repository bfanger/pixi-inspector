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

  devtools.on("connect", () => {
    const canvas = devtools.viewport.element() as HTMLCanvasElement;
    canvas.addEventListener?.("contextmenu", onContextMenu);
    canvas.addEventListener?.("pointerdown", onPointerDown);
    devtools.once("disconnect", () => {
      canvas.removeEventListener?.("contextmenu", onContextMenu);
      canvas.removeEventListener?.("pointerdown", onPointerDown);
    });
  });

  return {};
}
