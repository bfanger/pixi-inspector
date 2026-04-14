import { evalListen } from "ui-protocol/src/evalBridge";
import { defineRoot } from "ui-protocol/src/svelte/defineRoot";
import type { Engine } from "excalibur";
import excaliburPanel from "./excaliburPanel";

const win = window as any;
win.__UI_PROTOCOL__ = win.__UI_PROTOCOL__ ?? {};

export default function excaliburDevtools(engine: Engine) {
  win.$engine = engine;

  const rootController = defineRoot({
    children: [],
    sync(patch) {
      if (this.children?.length === 0) {
        patch.appends.push(excaliburPanel(engine));
      }
    },
    events: {
      reset() {
        rootController.children = [];
      },
    },
  });
  evalListen(rootController, "excalibur");

  // Expose pixi alias for the browser extension
  win.__UI_PROTOCOL__.pixi ??= win.__UI_PROTOCOL__.excalibur;
}
