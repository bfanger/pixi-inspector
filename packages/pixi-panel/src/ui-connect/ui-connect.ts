import type { Application, Container } from "pixi.js";
import conditionalNode from "ui-protocol/src/conditionalNode";
import refreshNode from "ui-protocol/src/refreshNode";
import { evalListen } from "ui-protocol/src/evalBridge";
import { defineRoot } from "ui-protocol/src/svelte/defineRoot";

const win = window as any;
win.__UI_PROTOCOL__ = win.__UI_PROTOCOL__ ?? {};

let attempt = 0;
let detected = "";
const root = defineRoot({
  children: [],
  sync(patch) {
    if (root.children.length === 0) {
      patch.appends.push(
        conditionalNode(
          () => {
            detected = detect();
            return !!detected;
          },
          {
            component: "Trigger",
            props: { event: detected },
          },
          refreshNode({
            interval: 100,
            depth: 1,
            sync(patch) {
              if (attempt === 100) {
                // after ~10s, only detect every 5s (when panel is open)
                patch.props = { interval: 5_000 };
                attempt = -1;
              } else if (attempt !== -1) {
                attempt++;
              }
            },
          }),
        ),
      );
    }
  },
  events: {
    reset() {
      attempt = 0;
      root.children = [];
    },
  },
});
evalListen(root, "connect");

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
  return "";
}

function getGlobal<T>(varname: string): T | undefined {
  if (varname in win) {
    return win[varname] as T;
  }
  if (win.frames) {
    for (let i = 0; i < win.frames.length; i += 1) {
      try {
        if (win.frames[i][varname]) {
          return win.frames[i][varname] as T;
        }
      } catch {
        // access to iframe was denied
      }
    }
  }
  return undefined;
}
