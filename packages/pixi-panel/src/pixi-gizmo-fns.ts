import type { PointData, Sprite } from "pixi.js";

export function getScreenLocation(node: Sprite) {
  return node.toGlobal({ x: node.pivot.x, y: node.pivot.y });
}

export function setScreenLocation(node: Sprite, point: PointData) {
  const parent = node.parent;
  if (!parent) {
    return;
  }
  const position = parent.toLocal(point);
  node.position.set(position.x, position.y);
}
