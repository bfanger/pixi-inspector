import { evalListen } from "ui-protocol/src/evalBridge";
import type { TreeControllerNode } from "ui-protocol/src/types";
import miniDetector from "./miniDetector";

const win = window as any;
win.__UI_PROTOCOL__ = win.__UI_PROTOCOL__ ?? {};
const root = {
  children: [],
  sync(patch) {
    if (root.children.length === 0) {
      patch.appends.push(miniDetector());
    }
  },
  events: {
    reset() {
      root.children = [];
    },
  },
} satisfies TreeControllerNode;
evalListen(root, "pixi");
