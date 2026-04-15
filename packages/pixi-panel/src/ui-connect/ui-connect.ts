import refreshNode from "ui-protocol/src/refreshNode";
import { evalListen } from "ui-protocol/src/evalBridge";
import { defineRoot } from "ui-protocol/src/svelte/defineRoot";
import conditionalNode from "ui-protocol/src/conditionalNode";

const win = window as any;
win.__UI_PROTOCOL__ = win.__UI_PROTOCOL__ ?? {};

const root = defineRoot({
  children: [],
  sync(patch) {
    if (root.children.length === 0) {
      let attempt = 0;
      let detected = detect();

      patch.appends.push(
        refreshNode({
          interval: 100,
          children: [
            conditionalNode(
              () => detected,
              (detectedRef) => ({
                component: "Trigger",
                props: { event: detectedRef.value },
              }),
            ),
          ],
          sync(patch) {
            detected = detect();
            if (detected) {
              return;
            }
            if (attempt === 100) {
              // after ~10s, only detect every 5s (when panel is open)
              patch.props = { interval: 5_000 };
              attempt = -1;
            } else if (attempt !== -1) {
              attempt++;
            }
          },
        }),
      );
    }
  },
  events: {
    reset() {
      root.children = [];
    },
  },
});
evalListen(root, "connect");

function detect() {
  if (win.__UI_PROTOCOL__?.["pixi"]) {
    return "ui";
  }
  if (win.__PIXI_APP__) {
    return "pixi";
  }
  if (win.__PHASER_GAME__) {
    return "phaser";
  }
  if (win.PHASER_GAME) {
    return "phaser";
  }
  if (win.__PIXI_RENDERER__) {
    return "pixi";
  }
  if (win.__PIXI_STAGE__) {
    return "pixi";
  }
  if (win.__PIXI_DEVTOOLS__) {
    return "pixi";
  }
  if (win.__PIXI_DEVTOOLS_WRAPPER__?.stage) {
    return "pixi";
  }
  if (win.PIXI) {
    return "patchable_pixi";
  }

  return undefined;
}
