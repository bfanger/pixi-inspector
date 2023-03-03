import type { GameObjects, Scene } from "phaser";
import type { Container, DisplayObject, IPointData, Sprite } from "pixi.js";
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
    let node = pointAt(point, devtools.root());
    if (!node) {
      node = boundsAt(point.x, point.y, devtools.root());
    }
    devtools.activate(node);
  }

  function coordinates(clientX: number, clientY: number) {
    const el = devtools.viewport.element();
    const bounds = el.getBoundingClientRect();
    const resolution = devtools.app?.renderer.resolution ?? 1;
    return {
      x: (clientX - bounds.x) * (el.width / resolution / bounds.width),
      y: (clientY - bounds.y) * (el.height / resolution / bounds.height),
    };
  }

  function pointAt(
    point: IPointData,
    container: Container | Scene
  ): DisplayObject | GameObjects.GameObject | undefined {
    for (const node of devtools.childrenOf(container) ?? []) {
      if (devtools.childrenOf(node)) {
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

  function boundsAt(
    x: number,
    y: number,
    container: Container | Scene
  ): DisplayObject | GameObjects.GameObject | undefined {
    const children = devtools.childrenOf(container);
    if (!children) {
      return undefined;
    }
    for (let i = children.length - 1; i >= 0; i -= 1) {
      const node = children[i];
      if (devtools.childrenOf(node)) {
        const found = boundsAt(x, y, node as Container);
        if (found) {
          return found;
        }
      }
      if (devtools.app && (node as DisplayObject).getBounds().contains(x, y)) {
        return node;
      }
    }
    return undefined;
  }

  devtools.on("connect", ({ app }) => {
    if (app) {
      const canvas = app.view as HTMLCanvasElement;
      canvas.addEventListener("contextmenu", onContextMenu);
      devtools.once("disconnect", () => {
        canvas.removeEventListener("contextmenu", onContextMenu);
      });
    }
  });

  return {};
}
