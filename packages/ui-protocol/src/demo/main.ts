import { mount } from "svelte";
import Display from "../svelte/Display.svelte";
import createReceiver from "../createReceiver";
import { createTestControllerTree } from "../../tests/createTestControllerTree";
import { GUI, type GUIController } from "dat.gui";

const el = document.body.querySelector("svelte-devtool");
if (!el) {
  throw new Error("Element <svelte-devtool> not found");
}
const [tree, game] = createTestControllerTree();
const receiver = createReceiver(tree);

mount(Display, {
  props: {
    receiver: {
      update: (data, event) => Promise.resolve(receiver.update(data, event)),
      sync: (data, path) => Promise.resolve(receiver.sync(data, path)),
    },
  },
  target: el,
});

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
  sync() {
    if (!game.player || !controller) {
      console.warn("No player");
      return;
    }
    controller.setValue(game.player.x);
  },
};
// add button to dat.gui
gui.add(methods, "remove");
gui.add(methods, "add");
gui.add(methods, "sync");
