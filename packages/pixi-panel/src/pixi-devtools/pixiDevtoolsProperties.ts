import type { GameObjects } from "phaser";
import type { NodeProperties, PixiDevtools, UniversalNode } from "../types";

export default function pixiDevtoolsProperties(devtools: PixiDevtools) {
  function isImage(node: UniversalNode): node is GameObjects.Image {
    return !!devtools.game && "x" in node && typeof node.x === "number";
  }
  return {
    getAll(): NodeProperties | undefined {
      const node = devtools.active();
      if (!node) {
        return undefined;
      }
      const props: NodeProperties = {};

      if (devtools.isDisplayObject(node)) {
        Object.assign(props, {
          x: node.x,
          y: node.y,
          angle: node.angle,
          scaleX: node.scale.x,
          scaleY: node.scale.y,
          width: (node as any).width,
          height: (node as any).height,
          skewX: node.skew.x,
          skewY: node.skew.y,
        } satisfies NodeProperties);
      } else if (isImage(node)) {
        Object.assign(props, {
          x: node.x,
          y: node.y,
          angle: node.angle,
          scaleX: node.scaleX,
          scaleY: node.scaleY,
          width: node.width,
          height: node.height,
        } satisfies NodeProperties);
      }
      if ("skew" in node && typeof node.skew === "object") {
        Object.assign(props, {
          skewX: node.skew.x,
          skewY: node.skew.y,
        } satisfies NodeProperties);
      }

      return props;
    },
    set(property: string, value: number) {
      const node = devtools.active();
      if (!node) {
        return;
      }
      if (devtools.isDisplayObject(node)) {
        if (property === "scaleX") {
          node.scale.x = value;
          return;
        }
        if (property === "scaleY") {
          node.scale.y = value;
          return;
        }
        if (property === "skewX") {
          node.skew.x = value;
          return;
        }
        if (property === "skewY") {
          node.skew.y = value;
          return;
        }
      }
      (node as any)[property] = value;
    },
  };
}
