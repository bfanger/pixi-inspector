import { mount, unmount } from "svelte";
import Display from "../../../packages/ui-protocol/src/svelte/Display.svelte";
import {
  evalConnect,
  evalListen,
} from "../../../packages/ui-protocol/src/evalBridge";
import "../../../packages/pixi-panel/src/pixi-devtools/ui-legacy";
import "../../../packages/pixi-panel/src/components";
import type { TreeControllerNode } from "../../../packages/ui-protocol/src/types";

const win = window as any;
const rootController = {
  children: [],
  sync(patch) {
    if (this.children?.length === 0) {
      patch.appends.push(win.__PIXI_DEVTOOLS_LEGACY__());
    }
  },
} satisfies TreeControllerNode;
evalListen(rootController, "pixi");

const target = document.querySelector("dev-tools");
if (target) {
  const devtools = mount(Display, {
    props: {
      base: true,
      connection: await evalConnect(
        "pixi",
        // eslint-disable-next-line @typescript-eslint/require-await
        async (code) => {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
          return eval(code);
        },
      ),
      onerror: () => {
        unmount(devtools);
        target.remove();
      },
    },
    target,
  });
} else {
  console.warn("No <dev-tools> element found");
}
