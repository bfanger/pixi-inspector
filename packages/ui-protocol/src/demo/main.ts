import { mount } from "svelte";
import Display from "../svelte/Display.svelte";
import createReceiver from "../createReceiver";
import { createTestControllerTree } from "../../tests/createTestControllerTree";
import { GUI } from "dat.gui";

const el = document.body.querySelector("svelte-devtool");
if (!el) {
  throw new Error("Element <svelte-devtool> not found");
}
const [tree, game] = createTestControllerTree();
const receiver = createReceiver(tree);

mount(Display, {
  props: {
    syncFn: (data, path) => Promise.resolve(receiver.sync(data, path)),
    updateFn: (data, event) => Promise.resolve(receiver.update(data, event)),
  },
  target: el,
});

const gui = new GUI();
const folder = gui.addFolder("Player");
if (game.player) {
  folder.add(game.player, "x", -100, 100);
  folder.open();
}
