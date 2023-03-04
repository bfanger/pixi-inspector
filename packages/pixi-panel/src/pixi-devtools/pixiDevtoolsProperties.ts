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
      if (devtools.isDisplayObject(node)) {
        return {
          x: node.x,
          y: node.y,
          rotation: node.rotation,
          scaleX: node.scale.x,
          scaleY: node.scale.y,
        };
      }
      if (isImage(node)) {
        return {
          x: node.x,
          y: node.y,
          rotation: node.rotation,
          scaleX: node.scaleX,
          scaleY: node.scaleY,
        };
      }

      return {};
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
      }
      (node as any)[property] = value;
    },
  };
}
