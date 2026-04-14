import { mount, unmount } from "svelte";
import Display from "ui-protocol/src/svelte/Display.svelte";
import { evalConnect, evalListen } from "ui-protocol/src/evalBridge";
import "pixi-panel/src/pixi-devtools/ui-legacy";
import "pixi-panel/src/components";
import { defineRoot } from "ui-protocol/src/svelte/defineRoot";
import { initLegacyUI } from "pixi-panel/src/pixi-devtools/ui-legacy";

const eventTarget = new EventTarget();
let first = true;
const rootController = defineRoot({
  children: [],
  sync(patch) {
    if (this.children?.length === 0) {
      if (!first) {
        // controller was reset, connection from real DevTools?
        eventTarget.dispatchEvent(new CustomEvent("recreated"));
      }
      first = false;
      patch.appends.push(initLegacyUI());
    }
  },
  events: {
    reset() {
      rootController.children = [];
    },
  },
});
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
      onerror: cleanup,
    },
    target,
  });
  function cleanup() {
    unmount(devtools);
    target?.remove();
  }
  eventTarget.addEventListener("recreated", cleanup);
} else {
  console.warn("No <dev-tools> element found");
}
