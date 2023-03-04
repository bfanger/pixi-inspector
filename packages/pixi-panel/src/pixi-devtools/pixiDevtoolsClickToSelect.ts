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
    devtools.activate(node);
  }

  devtools.on("connect", () => {
    const canvas = devtools.viewport.element() as HTMLCanvasElement;
    canvas.addEventListener?.("contextmenu", onContextMenu);
    devtools.once("disconnect", () => {
      canvas.removeEventListener?.("contextmenu", onContextMenu);
    });
  });

  return {};
}
