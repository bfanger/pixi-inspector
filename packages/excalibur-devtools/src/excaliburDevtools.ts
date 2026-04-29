import { evalListen } from "ui-protocol/src/evalBridge";
import rootController from "ui-protocol/src/controllers/rootController";
import type { Engine } from "excalibur";
import excaliburPanel from "./excaliburPanel";
import refreshController from "ui-protocol/src/controllers/refreshController";

const win = window as any;
win.__UI_PROTOCOL__ = win.__UI_PROTOCOL__ ?? {};

export default function excaliburDevtools(engine: Engine) {
  win.$engine = engine;

  evalListen(
    "excalibur",
    rootController(() => [
      refreshController({
        interval: 1000,
        depth: 1,
      }),
      excaliburPanel(engine),
    ]),
  );

  // Expose pixi alias for the browser extension
  win.__UI_PROTOCOL__.pixi ??= win.__UI_PROTOCOL__.excalibur;
}
