import { derived, Readable } from "svelte/store";
import type { BridgeFn } from "./types";
import pixiDevtools from "./pixi-devtools/pixiDevtools";
import pixiDevtoolsOutline from "./pixi-devtools/pixiDevtoolsOutline";
import pixiDevtoolsOverlay from "./pixi-devtools/pixiDevtoolsOverlay";
import pixiDevtoolsProperties from "./pixi-devtools/pixiDevtoolsProperties";

import { poll } from "./bridge-fns";

export default function connect(bridge: BridgeFn): Readable<boolean> {
  const detected = poll<string>(
    bridge,
    // eslint-disable-next-line no-template-curly-in-string
    "`${typeof window.__PIXI_DEVTOOLS__}-${typeof window.__PIXI_DEVTOOLS__?.app !== 'undefined' && window.__PIXI_DEVTOOLS__?.app === (window.__PIXI_APP__ ?? window.frames[0]?.__PIXI_APP__)}`",
    2500
  );
  return derived(detected, ($detected) => {
    if ($detected.data === "object-true") {
      return true;
    }
    if ($detected.data === "undefined-false") {
      bridge(`(() => {
        window.__PIXI_DEVTOOLS__ = (${pixiDevtools.toString()}());
        window.__PIXI_DEVTOOLS__.outline = (${pixiDevtoolsOutline.toString()}(window.__PIXI_DEVTOOLS__));
        window.__PIXI_DEVTOOLS__.overlay = (${pixiDevtoolsOverlay.toString()}(window.__PIXI_DEVTOOLS__));
        window.__PIXI_DEVTOOLS__.properties = (${pixiDevtoolsProperties.toString()}(window.__PIXI_DEVTOOLS__));
      })();`).then(() => detected.sync());
    }
    if ($detected.data === "object-false") {
      bridge("window.__PIXI_DEVTOOLS__.reconnect()").then((success) => {
        if (success) {
          detected.sync();
        }
      });
    }

    return false;
  });
}
