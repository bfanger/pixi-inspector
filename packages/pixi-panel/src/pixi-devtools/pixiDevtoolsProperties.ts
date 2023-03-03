import type { GameObjects } from "phaser";
import type { DisplayObject } from "pixi.js";
import type { NodeProperties, PixiDevtools } from "../types";

export default function pixiDevtoolsProperties(devtools: PixiDevtools) {
  function isDisplayObject(
    node: DisplayObject | GameObjects.GameObject
  ): node is DisplayObject {
    return !!devtools.app;
  }
  function isImage(node: GameObjects.GameObject): node is GameObjects.Image {
    return !!devtools.game && "x" in node;
  }
  return {
    getAll(): NodeProperties | undefined {
      const node = devtools.active();
      if (!node) {
        return undefined;
      }
      if (isDisplayObject(node)) {
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
      if (isDisplayObject(node)) {
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
