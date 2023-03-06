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
  function hasGlobal(varname: string) {
    if (win[varname]) {
      return win[varname];
    }
    if (win.frames) {
      for (let i = 0; i < win.frames.length; i += 1) {
        if (win.frames[i][varname]) {
          return true;
        }
      }
    }
    return false;
  }
  const detected =
    hasGlobal("__PIXI_APP__") ||
    hasGlobal("__PHASER_GAME__") ||
    hasGlobal("__PIXI_STAGE__") ||
    hasGlobal("__PIXI_RENDERER__");

  if (win.__PIXI_DEVTOOLS__ !== undefined) {
    if (detected) {
      return "CONNECTED";
    }
    return "DISCONNECTED";
  }
  if (detected) {
    return "INJECT";
  }
  return "NOT_FOUND";
}

export default function connect(
  bridge: BridgeFn
): Readable<boolean> & { retry: () => void } {
  const detected = poll<ReturnType<typeof detect>>(
    bridge,
    `(${detect.toString()}())`,

    2500
  );
  const readable = derived(detected, ({ data, error }) => {
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

    return false;
  });
  return {
    subscribe: readable.subscribe,
    retry() {
      detected.sync();
    },
  };
}
