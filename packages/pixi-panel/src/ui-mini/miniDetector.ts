import type { Application } from "pixi.js";
import type { TreeInit } from "ui-protocol/src/types";

export default function miniDetector() {
  const win = window as any;
  let app = win.__PIXI_APP__ as Application | undefined;

  const instructionsNode = {
    component: "Instructions",
    children: [],
    props: {},
    node: {},
  } satisfies TreeInit;
  const injectNode = {
    component: "PixiInject",
    children: [],
    props: {},
    node: {},
  } satisfies TreeInit;
  let injected = false;

  function createNode(app: Application | undefined): TreeInit {
    if (!app) {
      return instructionsNode;
    }
    const legacyInit: unknown = win.__PIXI_DEVTOOLS_LEGACY__;
    if (typeof legacyInit === "function") {
      injected = true;
      return legacyInit() as TreeInit;
    }
    return injectNode;
  }

  return {
    component: "Fragment",
    props: {},
    children: [createNode(app)],
    node: {
      sync(out) {
        const detected = win.__PIXI_APP__ as Application | undefined;
        if (detected && win.__PIXI_DEVTOOLS_LEGACY__ && !injected) {
          out.replacements.push({ index: 0, ...createNode(detected) });
        } else if (app !== detected) {
          out.replacements.push({ index: 0, ...createNode(detected) });
        }
        app = detected;
      },
    },
  } satisfies TreeInit;
}
