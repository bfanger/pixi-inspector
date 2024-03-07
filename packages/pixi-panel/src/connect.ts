/* eslint-disable no-underscore-dangle */
import { derived, Readable, writable } from "svelte/store";
import type { BridgeFn } from "./types";
import pixiDevtools from "./pixi-devtools/pixiDevtools";
import pixiDevtoolsSelection from "./pixi-devtools/pixiDevtoolsSelection";
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
      return true;
    }
    if (win.frames) {
      for (let i = 0; i < win.frames.length; i += 1) {
        try {
          if (win.frames[i][varname]) {
            return true;
          }
        } catch (_) {
          // access to iframe was denied
        }
      }
    }
    return false;
  }
  const detected =
    hasGlobal("__PIXI_APP__") ||
    hasGlobal("__PHASER_GAME__") ||
    hasGlobal("__PIXI_STAGE__") ||
    hasGlobal("__PIXI_RENDERER__") ||
    hasGlobal("__PATCHED_RENDERER__");

  if (win.__PIXI_DEVTOOLS__ !== undefined) {
    if (detected) {
      return "CONNECTED";
    }
    if (hasGlobal("PIXI")) {
      return "PATCHABLE";
    }
    return "DISCONNECTED";
  }
  if (detected) {
    return "INJECT";
  }
  if (hasGlobal("PIXI")) {
    return "PATCHABLE";
  }
  return "NOT_FOUND";
}

export default function connect(bridge: BridgeFn): Readable<
  "NOT_FOUND" | "INJECT" | "CONNECTED" | "DISCONNECTED" | "PATCHABLE" | "ERROR"
> & {
  error: Readable<Error | undefined>;
  retry: () => void;
} {
  const detected = poll<ReturnType<typeof detect>>(
    bridge,
    `(${detect.toString()}())`,

    2500,
  );
  const errorStore = writable<Error | undefined>();
  const readable = derived(detected, ({ data, error }) => {
    if (error || typeof data === "undefined") {
      const message = error?.message;
      if (typeof message === "string" && message.endsWith(": %s")) {
        errorStore.set(new Error(message.substring(0, message.length - 4)));
      } else if (typeof error !== "undefined") {
        console.warn(error);
        errorStore.set(error);
      }
      return "ERROR";
    }
    if (data === "INJECT") {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      bridge(`(() => {
        window.__PIXI_DEVTOOLS__ = (${pixiDevtools.toString()}());
        window.__PIXI_DEVTOOLS__.selection = (${pixiDevtoolsSelection.toString()}(window.__PIXI_DEVTOOLS__));
        window.__PIXI_DEVTOOLS__.viewport = (${pixiDevtoolsViewport.toString()}(window.__PIXI_DEVTOOLS__));
        window.__PIXI_DEVTOOLS__.outline = (${pixiDevtoolsOutline.toString()}(window.__PIXI_DEVTOOLS__));
        window.__PIXI_DEVTOOLS__.overlay = (${pixiDevtoolsOverlay.toString()}(window.__PIXI_DEVTOOLS__));
        window.__PIXI_DEVTOOLS__.properties = (${pixiDevtoolsProperties.toString()}(window.__PIXI_DEVTOOLS__));
        window.__PIXI_DEVTOOLS__.clickToSelect = (${pixiDevtoolsClickToSelect.toString()}(window.__PIXI_DEVTOOLS__));
      })();`).then(() => detected.sync());
    }

    return data;
  });
  return {
    subscribe: readable.subscribe,
    error: { subscribe: errorStore.subscribe },
    retry() {
      detected.sync();
    },
  };
}
