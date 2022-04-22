import { derived, Readable, writable } from "svelte/store";
import { injectGlobal, poll } from "./bridge-fns";
import type { BridgeFn } from "./types";
import createPixiDevtools from "./createPixiDevtools";

export default function isConnected(bridge: BridgeFn): Readable<boolean> {
  const detected = poll<string>(
    bridge,
    "typeof (window.__PIXI_APP__ || window.frames[0]?.__PIXI_APP__) + '-' + typeof window['__PIXI_DEVTOOLS__']",
    1000
  );
  const injected = writable<"NEW" | "INJECTING" | "INJECTED">("NEW");
  return derived([detected, injected], ([$detected, $injected]) => {
    if ($detected.data === "object-object") {
      return true;
    }
    if ($detected.data === "object-undefined" && $injected !== "INJECTING") {
      injected.set("INJECTING");
      injectGlobal(bridge, "__PIXI_DEVTOOLS__", createPixiDevtools).then(() => {
        injected.set("INJECTED");
      });
    }
    return false;
  });
}
