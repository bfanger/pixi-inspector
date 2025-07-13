import { mount } from "svelte";
import { GUI, type GUIController } from "dat.gui";
import Display from "../svelte/Display.svelte";
import { createTestControllerTree } from "../../tests/createTestControllerTree";
import { iframeConnect, iframeListen } from "../iframeBridge";

const devtool = document.body.querySelector("ui-devtool");
const iframe = document.querySelector<HTMLIFrameElement>("iframe#ui-game");
const insideIframe = document.body.querySelector("ui-iframe");
if (devtool && iframe?.contentWindow) {
  // throw new Error("Element <svelte-devtool> not found");
  const abortController = new AbortController();
  mount(Display, {
    props: {
      connection: await iframeConnect(
        iframe.contentWindow,
        "demo",
        abortController.signal,
      ),
    },
    target: devtool,
  });
}

if (insideIframe) {
  const [tree, game] = createTestControllerTree();
  const abortController = new AbortController();
  iframeListen(tree, window, "demo", abortController.signal);

  const gui = new GUI();
  const folder = gui.addFolder("Player");
  let controller: GUIController | undefined;
  if (game.player) {
    controller = folder.add(game.player, "x", -100, 100);
    folder.open();
  }
  const methods = {
    remove() {
      game.player = undefined;
      controller?.remove();
      controller = undefined;
    },
    add() {
      if (game.player) {
        console.warn("Player already added");
        return;
      }
      game.player = { x: 0, y: 0 };
      controller = folder.add(game.player, "x", -100, 100);
    },
  };
  // add button to dat.gui
  gui.add(methods, "remove");
  gui.add(methods, "add");

  setInterval(() => {
    if (
      game.player &&
      controller &&
      document.activeElement?.nodeName !== "INPUT"
    ) {
      controller.updateDisplay();
    }
  }, 100);
}
