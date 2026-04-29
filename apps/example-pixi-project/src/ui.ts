import { mount, unmount } from "svelte";
import Display from "ui-protocol/src/svelte/Display.svelte";
import { evalConnect, evalListen } from "ui-protocol/src/evalBridge";
import "pixi-panel/src/pixi-devtools/ui-legacy";
import "pixi-panel/src/components";
import rootController from "ui-protocol/src/controllers/rootController";
import { initLegacyUI } from "pixi-panel/src/pixi-devtools/ui-legacy";

const eventTarget = new EventTarget();
let first = true;
evalListen(
  "pixi",
  rootController(() => [initLegacyUI()], {
    reset: () => {
      if (!first) {
        // controller was reset again? Assume connection from the browser's DevTools panel.
        eventTarget.dispatchEvent(new CustomEvent("recreated"));
      }
      first = false;
      return;
    },
  }),
);

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
