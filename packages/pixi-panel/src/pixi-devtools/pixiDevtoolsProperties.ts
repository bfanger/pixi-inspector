import type { DisplayObject, Sprite } from "pixi.js";
import type { NodeProperties } from "../types";

export default function pixiDevtoolsProperties() {
  return {
    getAll(): NodeProperties | undefined {
      const $pixi = (window as any).$pixi as DisplayObject | Sprite | undefined;
      if (!$pixi) {
        return undefined;
      }
      return {
        x: $pixi.x,
        y: $pixi.y,
        rotation: $pixi.rotation,
        scaleX: $pixi.scale.x,
        scaleY: $pixi.scale.y,
      };
    },
    set(property: string, value: number) {
      const $pixi = (window as any).$pixi as DisplayObject | Sprite | undefined;
      if (!$pixi) {
        return;
      }
      if (property === "scaleX") {
        $pixi.scale.x = value;
      } else if (property === "scaleY") {
        $pixi.scale.y = value;
      } else {
        $pixi[property] = value;
      }
    },
  };
}
