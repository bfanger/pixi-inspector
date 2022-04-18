import { Readable, readable } from "svelte/store";
import { injectGlobal } from "./bridge-fns";
import type { BridgeFn } from "./types";
import createPixiDevtools from "./createPixiDevtools";

export default function isConnected(bridge: BridgeFn): Readable<boolean> {
  async function findPixiApp() {
    try {
      const type = await bridge(
        "typeof window['__PIXI_APP__'] + '-' + typeof window['__PIXI_DEVTOOLS__']"
      );
      if (type === "object-object") {
        return true;
      } else if (type === "object-undefined") {
        await injectGlobal(bridge, "__PIXI_DEVTOOLS__", createPixiDevtools);
        return true;
      }
      return false;
    } catch (err) {
      return false;
    }
  }
  return readable<boolean>(false, (set) => {
    const timer = setInterval(async () => {
      set(await findPixiApp());
    }, 5000);
    findPixiApp().then(set);
    return () => clearInterval(timer);
  });
}
