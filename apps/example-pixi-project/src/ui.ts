import { mount, unmount } from "svelte";
import Display from "../../../packages/ui-protocol/src/svelte/Display.svelte";
import {
  iframeConnect,
  iframeListen,
} from "../../../packages/ui-protocol/src/iframeBridge";
import type {
  TreeControllerNode,
  TreeValue,
} from "../../../packages/ui-protocol/src/types";

import type { PixiDevtools } from "../../../packages/pixi-panel/src/types";
import pixiDevtools from "../../../packages/pixi-panel/src/pixi-devtools/pixiDevtools";
import pixiDevtoolsOutline from "../../../packages/pixi-panel/src/pixi-devtools/pixiDevtoolsOutline";
import pixiDevtoolsSelection from "../../../packages/pixi-panel/src/pixi-devtools/pixiDevtoolsSelection";

const abortController = new AbortController();

const legacy = pixiDevtools() as PixiDevtools;
legacy.selection = pixiDevtoolsSelection(legacy);
legacy.outline = pixiDevtoolsOutline(legacy);
// win.__PIXI_INSPECTOR_LEGACY__.viewport = (${pixiDevtoolsViewport.toString()}(win.__PIXI_INSPECTOR_LEGACY__));
// win.__PIXI_INSPECTOR_LEGACY__.overlay = (${pixiDevtoolsOverlay.toString()}(win.__PIXI_INSPECTOR_LEGACY__));
// win.__PIXI_INSPECTOR_LEGACY__.properties = (${pixiDevtoolsProperties.toString()}(win.__PIXI_INSPECTOR_LEGACY__));
// win.__PIXI_INSPECTOR_LEGACY__.clickToSelect = (${pixiDevtoolsClickToSelect.toString()}(win.__PIXI_INSPECTOR_LEGACY__));

const legacyController = {
  children: [],
  sync(out) {
    if (legacyController.children?.length === 0) {
      out.appends.push({
        component: "ScheneGraphLegacy",
        props: {},
        value: legacy.outline.tree(),
        node: {
          sync(out) {
            out.value = legacy.outline.tree();
          },
          events: {
            onexpand(path: TreeValue) {
              legacy.outline.expand(path as string[]);
            },
            oncollapse(path: TreeValue) {
              legacy.outline.collapse(path as string[]);
            },
            onactivate(path: TreeValue) {
              legacy.outline.activate(path as string[]);
            },
            onselectable(path: TreeValue) {
              legacy.outline.selectable(path as string[]);
            },
            onunselectable(path: TreeValue) {
              legacy.outline.unselectable(path as string[]);
            },
            onshow(path: TreeValue) {
              legacy.outline.show(path as string[]);
            },
            onhide(path: TreeValue) {
              legacy.outline.hide(path as string[]);
            },
            onlog(path: TreeValue) {
              legacy.outline.log(path as string[]);
            },
            onmouseenter(path: TreeValue) {
              legacy.outline.highlight(path as string[]);
            },
            onmouseleave() {
              legacy.outline.highlight([]);
            },
          },
        },
        children: [
          {
            component: "SearchField",
            value: legacy.outline.query,
            props: { label: "Search" },
            node: {
              sync(out) {
                out.value = legacy.outline.query;
              },
              events: {
                setValue(value: TreeValue) {
                  legacy.outline.query = value as string;
                  return 1;
                },
              },
            },
          },
        ],
      });
    }
  },
} satisfies TreeControllerNode;

iframeListen(legacyController, window, "pixi", abortController.signal);

const target = document.createElement("div");
document.body.appendChild(target);

const devtools = mount(Display, {
  props: {
    connection: await iframeConnect(window, "pixi", abortController.signal),
    ondisconnect: () => {
      unmount(devtools);
      target.remove();
    },
  },
  target,
});
