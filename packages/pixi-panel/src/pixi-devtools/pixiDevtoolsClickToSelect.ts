import type { Container, IPointData, Sprite } from "pixi.js";
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
    const point = coordinates(e.clientX, e.clientY);
    let node = pointAt(point, devtools.app.stage);
    if (!node) {
      node = boundsAt(point.x, point.y, devtools.app.stage);
    }
    devtools.activate(node);
  }

  function coordinates(clientX: number, clientY: number) {
    const bounds = devtools.app.view.getBoundingClientRect();
    return {
      x:
        (clientX - bounds.x) *
        (devtools.app.view.width /
          devtools.app.renderer.resolution /
          bounds.width),
      y:
        (clientY - bounds.y) *
        (devtools.app.view.height /
          devtools.app.renderer.resolution /
          bounds.height),
    };
  }

  function pointAt(point: IPointData, container: Container) {
    for (const node of container.children) {
      if ("children" in node) {
        const found = pointAt(point, node as Container);
        if (found) {
          return found;
        }
      }
      if ((node as Sprite).containsPoint?.(point)) {
        return node;
      }
    }
    return undefined;
  }

  function boundsAt(x: number, y: number, container: Container) {
    for (const node of container.children) {
      if ("children" in node) {
        const found = boundsAt(x, y, node as Container);
        if (found) {
          return found;
        }
      }
      if (node.getBounds().contains(x, y)) {
        return node;
      }
    }
    return undefined;
  }

  devtools.on("connect", (app) => {
    app.view.addEventListener("contextmenu", onContextMenu);
    devtools.once("disconnect", () => {
      app.view.removeEventListener("contextmenu", onContextMenu);
    });
  });

  return {};
}
