import type { Application, Container } from "pixi.js";
import type { TreeInit } from "ui-protocol/src/types";

const win = window as any;
export default function miniDetector() {
  let previous = detectClient();
  let injected = false;

  return {
    component: "Fragment",
    props: {},
    children: [createNode(previous)],
    node: {
      sync(out) {
        const client = detectClient();
        if (client && win.__PIXI_DEVTOOLS_LEGACY__ && !injected) {
          injected = true;
          out.replacements.push({ index: 0, ...createNode(client) });
        } else if (previous !== client) {
          out.replacements.push({ index: 0, ...createNode(client) });
        }
        previous = client;
      },
    },
  } satisfies TreeInit;
}

function createNode(app: DetectedClient): TreeInit {
  if (!app) {
    return {
      component: "Instructions",
      children: [],
      props: {},
      node: {},
    };
  }
  const legacyInit: unknown = win.__PIXI_DEVTOOLS_LEGACY__;
  if (typeof legacyInit === "function") {
    return legacyInit() as TreeInit;
  }
  return {
    component: "PixiInject",
    children: [],
    props: {},
    node: {},
  };
}

type DetectedClient = ReturnType<typeof detectClient>;
function detectClient() {
  const app = getGlobal<Application>("__PIXI_APP__");
  if (app) {
    return app;
  }
  const stage = getGlobal<Container>("__PIXI_STAGE__");
  if (stage) {
    return stage;
  }
  const game = getGlobal<unknown>("__PHASER_GAME__");
  if (game) {
    return game;
  }
  const renderer = getGlobal<unknown>("__PIXI_RENDERER__");
  if (renderer) {
    return renderer;
  }
  return undefined;
}

function getGlobal<T>(varname: string): T | undefined {
  if (varname in win) {
    return win[varname] as T;
  }
  if (win.frames) {
    for (let i = 0; i < win.frames.length; i += 1) {
      try {
        if (varname in win.frames[i]) {
          return win.frames[i][varname] as T;
        }
      } catch {
        // access to iframe was denied
      }
    }
  }
  return undefined;
}
