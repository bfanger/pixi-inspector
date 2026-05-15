import refreshController from "ui-protocol/src/controllers/refreshController";
import { evalListen } from "ui-protocol/src/evalBridge";
import rootController from "ui-protocol/src/controllers/rootController";
import ifController from "ui-protocol/src/controllers/ifController";

const win = window as any;
win.__UI_PROTOCOL__ = win.__UI_PROTOCOL__ ?? {};

evalListen(
  "connect",
  rootController(() => {
    let attempt = 0;
    let detected = detect();

    return [
      refreshController({
        interval: 100,
        children: [
          ifController(
            () => detected,
            (detectedRef) => [
              {
                component: "Trigger",
                props: { event: detectedRef.value },
              },
            ],
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
    ];
  }),
);

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
