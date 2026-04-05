import { evalListen } from "ui-protocol/src/evalBridge";
import miniDetector from "./miniDetector";
import { defineRoot } from "ui-protocol/src/svelte/defineRoot";

const win = window as any;
win.__UI_PROTOCOL__ = win.__UI_PROTOCOL__ ?? {};
const root = defineRoot({
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
});
evalListen(root, "pixi");
