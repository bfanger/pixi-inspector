import type { NodeProperties, PixiDevtools } from "../types";

export default function pixiDevtoolsProperties(devtools: PixiDevtools) {
  return {
    getAll(): NodeProperties | undefined {
      const node = devtools.active();
      if (!node) {
        return undefined;
      }
      return {
        x: node.x,
        y: node.y,
        rotation: node.rotation,
        scaleX: node.scale.x,
        scaleY: node.scale.y,
      };
    },
    set(property: string, value: number) {
      const node = devtools.active();
      if (!node) {
        return;
      }
      if (property === "scaleX") {
        node.scale.x = value;
      } else if (property === "scaleY") {
        node.scale.y = value;
      } else {
        node[property] = value;
      }
    },
  };
}
