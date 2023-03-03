/* eslint-disable no-underscore-dangle */
import { derived, Readable } from "svelte/store";
import type { BridgeFn } from "./types";
import pixiDevtools from "./pixi-devtools/pixiDevtools";
import pixiDevtoolsViewport from "./pixi-devtools/pixiDevtoolsViewport";
import pixiDevtoolsOutline from "./pixi-devtools/pixiDevtoolsOutline";
import pixiDevtoolsOverlay from "./pixi-devtools/pixiDevtoolsOverlay";
import pixiDevtoolsProperties from "./pixi-devtools/pixiDevtoolsProperties";
import pixiDevtoolsClickToSelect from "./pixi-devtools/pixiDevtoolsClickToSelect";

import { poll } from "./bridge-fns";

function detect() {
  const win = window as any;
  if (typeof win.__PIXI_DEVTOOLS__ !== "undefined") {
    if (typeof win.__PIXI_APP__ !== "undefined") {
      if (win.__PIXI_DEVTOOLS__.app !== win.__PIXI_APP__) {
        return "CONNECT";
      }
    }
    if (typeof win.__PHASER_GAME__ !== "undefined") {
      if (win.__PIXI_DEVTOOLS__.game !== win.__PHASER_GAME__) {
        return "CONNECT";
      }
    }
    return "CONNECTED";
  }
  if (
    typeof win.__PIXI_APP__ !== "undefined" ||
    typeof win.__PHASER_GAME__ !== "undefined"
  ) {
    return "INJECT";
  }
  return "DETECTING";
}
export default function connect(bridge: BridgeFn): Readable<boolean> {
  const detected = poll<ReturnType<typeof detect>>(
    bridge,
    `(${detect.toString()}())`,

    2500
  );
  return derived(detected, ({ data, error }) => {
    if (error) {
      console.warn(error);
    }
    if (data === "CONNECTED") {
      return true;
    }
    if (data === "INJECT") {
      bridge(`(() => {
        window.__PIXI_DEVTOOLS__ = (${pixiDevtools.toString()}());
        window.__PIXI_DEVTOOLS__.viewport = (${pixiDevtoolsViewport.toString()}(window.__PIXI_DEVTOOLS__));
        window.__PIXI_DEVTOOLS__.outline = (${pixiDevtoolsOutline.toString()}(window.__PIXI_DEVTOOLS__));
        window.__PIXI_DEVTOOLS__.overlay = (${pixiDevtoolsOverlay.toString()}(window.__PIXI_DEVTOOLS__));
        window.__PIXI_DEVTOOLS__.properties = (${pixiDevtoolsProperties.toString()}(window.__PIXI_DEVTOOLS__));
        window.__PIXI_DEVTOOLS__.clickToSelect = (${pixiDevtoolsClickToSelect.toString()}(window.__PIXI_DEVTOOLS__));
      })();`).then(() => detected.sync());
    }
    if (data === "CONNECT") {
      bridge("window.__PIXI_DEVTOOLS__.reconnect()").then((success) => {
        if (success) {
          detected.sync();
        }
      });
    }

    return false;
  });
}
