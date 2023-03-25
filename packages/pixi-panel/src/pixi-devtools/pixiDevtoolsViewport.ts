import type { IPointData, Rectangle } from "pixi.js";
import type { PixiDevtools, UniversalNode } from "../types";

export default function pixiDevtoolsViewport(devtools: PixiDevtools) {
  function findNodesAt(
    point: IPointData,
    node: UniversalNode,
    filter: (node: UniversalNode) => boolean
  ): UniversalNode[] {
    if (!filter(node)) {
      return [];
    }
    const children = devtools.childrenOf(node);
    const nodes: UniversalNode[] = [];
    if (children) {
      for (let i = children.length - 1; i >= 0; i -= 1) {
        const child = children[i];
        nodes.push(...findNodesAt(point, child, filter));
      }
    }
    if (
      "containsPoint" in node &&
      typeof node.containsPoint === "function" &&
      node.containsPoint(point)
    ) {
      nodes.push(node);
    } else if ("getBounds" in node) {
      const bounds: Rectangle = node.getBounds();
      if (bounds.contains(point.x, point.y)) {
        nodes.push(node);
      }
    }
    return nodes;
  }

  return {
    size() {
      const renderer = devtools.renderer();
      if (renderer) {
        if ("width" in renderer) {
          return {
            width: renderer.width,
            height: renderer.height,
          };
        }
        return {
          width: renderer.scale.displaySize.width,
          height: renderer.scale.displaySize.height,
        };
      }
      return undefined;
    },
    scale(): IPointData | undefined {
      const renderer = devtools.renderer();
      if (renderer) {
        if ("resolution" in renderer) {
          return {
            x: renderer.resolution,
            y: renderer.resolution,
          };
        }
        return renderer.scale.displayScale;
      }
      return undefined;
    },
    fromClient(clientX: number, clientY: number): IPointData {
      const el = devtools.canvas();
      const scale = this.scale();
      if (el && scale && "getBoundingClientRect" in el) {
        const bounds = (el as HTMLCanvasElement).getBoundingClientRect();
        return {
          x: (clientX - bounds.x) * (el.width / scale.x / bounds.width),
          y: (clientY - bounds.y) * (el.height / scale.y / bounds.height),
        };
      }
      throw new Error("offscreen canvas?");
    },
    ray(
      point: IPointData,
      filter: (node: UniversalNode) => boolean = () => true
    ): UniversalNode[] {
      const root = devtools.root();
      if (!root) {
        return [];
      }
      const nodes = findNodesAt(point, root, filter);
      return nodes;
    },
  };
}
