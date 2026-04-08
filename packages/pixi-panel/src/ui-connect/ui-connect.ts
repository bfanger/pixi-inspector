import type { Application, Container } from "pixi.js";
import conditionalNode from "ui-protocol/src/conditionalNode";
import refreshNode from "ui-protocol/src/refreshNode";
import { evalListen } from "ui-protocol/src/evalBridge";
import { defineRoot } from "ui-protocol/src/svelte/defineRoot";

const win = window as any;
win.__UI_PROTOCOL__ = win.__UI_PROTOCOL__ ?? {};

const root = defineRoot({
  children: [],
  sync(patch) {
    if (root.children.length === 0) {
      patch.appends.push(connectDetector());
    }
  },
  events: {
    reset() {
      root.children = [];
    },
  },
});
evalListen(root, "connect");

function connectDetector() {
  let detected = detect();
  let attempt = 0;

  return refreshNode({
    interval: 250,
    children: [
      conditionalNode(
        () => !!detected,
        () => ({
          component: "Trigger",
          props: { data: detected },
        }),
      ),
    ],
    sync(patch) {
      detected = detect();
      attempt++;
      if (attempt === 40) {
        patch.props = { interval: 5_000 };
      }
    },
  });
}

function detect() {
  const app = getGlobal<Application>("__PIXI_APP__");
  if (app) {
    return "pixi";
  }
  const stage = getGlobal<Container>("__PIXI_STAGE__");
  if (stage) {
    return "pixi";
  }
  const game = getGlobal<unknown>("__PHASER_GAME__");
  if (game) {
    return "phaser";
  }
  const renderer = getGlobal<unknown>("__PIXI_RENDERER__");
  if (renderer) {
    return "pixi";
  }
  const officialHook = getGlobal<{ stage: unknown } | undefined>(
    "__PIXI_DEVTOOLS_WRAPPER__",
  );
  if (officialHook?.stage) {
    return "pixi";
  }
  if (getGlobal("PIXI")) {
    return "patchable";
  }
  return undefined;
}

function getGlobal<T>(varname: string): T | undefined {
  if (varname in win) {
    return win[varname] as T;
  }
  return undefined;
}
