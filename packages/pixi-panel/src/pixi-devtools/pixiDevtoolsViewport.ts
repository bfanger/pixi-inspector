import type { IPointData, Rectangle } from "pixi.js";
import type { PixiDevtools, UniversalNode } from "../types";

export default function pixiDevtoolsViewport(devtools: PixiDevtools) {
  function findNodeAt(
    point: IPointData,
    node: UniversalNode
  ): UniversalNode | undefined {
    if (!devtools.app) {
      return undefined;
    }
    const children = devtools.childrenOf(node);
    if (children) {
      for (let i = children.length - 1; i >= 0; i -= 1) {
        const child = children[i];
        const found = findNodeAt(point, child);
        if (found) {
          return found;
        }
      }
    }
    if (
      "containsPoint" in node &&
      typeof node.containsPoint === "function" &&
      node.containsPoint(point)
    ) {
      return node;
    }
    return undefined;
  }

  function findNodeBoundsAt(
    point: IPointData,
    node: UniversalNode
  ): UniversalNode | undefined {
    const children = devtools.childrenOf(node);
    if (children) {
      for (let i = children.length - 1; i >= 0; i -= 1) {
        const child = children[i];
        const found = findNodeBoundsAt(point, child);
        if (found) {
          return found;
        }
      }
    }
    if ("getBounds" in node) {
      const bounds: Rectangle = node.getBounds();
      if (bounds.contains(point.x, point.y)) {
        return node;
      }
    }
    return undefined;
  }
  return {
    element() {
      if (devtools.app) {
        return devtools.app.view;
      }
      if (devtools.game) {
        return devtools.game.canvas;
      }
      throw new Error("Not connected");
    },
    size() {
      if (devtools.app) {
        return {
          width: devtools.app.renderer.width,
          height: devtools.app.renderer.height,
        };
      }
      if (devtools.game) {
        return {
          width: devtools.game.scale.displaySize.width,
          height: devtools.game.scale.displaySize.height,
        };
      }
      throw new Error("Not connected");
    },
    scale() {
      if (devtools.app) {
        return {
          x: devtools.app.renderer.resolution,
          y: devtools.app.renderer.resolution,
        };
      }
      if (devtools.game) {
        return devtools.game.scale.displayScale;
      }
      throw new Error("Not connected");
    },
    fromClient(clientX: number, clientY: number): IPointData {
      const el = this.element();
      if ("getBoundingClientRect" in el) {
        const bounds = (el as HTMLCanvasElement).getBoundingClientRect();
        const scale = this.scale();
        return {
          x: (clientX - bounds.x) * (el.width / scale.x / bounds.width),
          y: (clientY - bounds.y) * (el.height / scale.y / bounds.height),
        };
      }
      throw new Error("offscreen canvas?");
    },
    ray(point: IPointData): UniversalNode | undefined {
      const root = devtools.root();
      const node = findNodeAt(point, root);
      if (node) {
        return node;
      }
      return findNodeBoundsAt(point, root);
    },
  };
}
