import { Readable, readable } from "svelte/store";
import type { Bridge } from "./types";

export default function isConnected(bridge: Bridge): Readable<boolean> {
  async function findPixiApp() {
    try {
      const type = await bridge.eval(
        "typeof window['__PIXI_APP__'] + typeof window['__PIXI_DEVTOOLS__']"
      );
      if (type === "objectobject") {
        return true;
      } else if (type === "objectundefined") {
        await bridge.eval(
          "window['__PIXI_DEVTOOLS__'] = window['__PIXI_DEVTOOLS__'] || [];"
        );
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
    }, 10000);
    findPixiApp().then(set);
    return () => clearInterval(timer);
  });
}
