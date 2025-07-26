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

import type {
  PixiDevtools,
  PropertyTab,
} from "../../../packages/pixi-panel/src/types";
import pixiDevtools from "../../../packages/pixi-panel/src/pixi-devtools/pixiDevtools";
import pixiDevtoolsOutline from "../../../packages/pixi-panel/src/pixi-devtools/pixiDevtoolsOutline";
import pixiDevtoolsSelection from "../../../packages/pixi-panel/src/pixi-devtools/pixiDevtoolsSelection";
import pixiDevtoolsProperties from "../../../packages/pixi-panel/src/pixi-devtools/pixiDevtoolsProperties";

const abortController = new AbortController();

const legacy = pixiDevtools() as PixiDevtools;
legacy.selection = pixiDevtoolsSelection(legacy);
const outline = pixiDevtoolsOutline(legacy);
legacy.outline = outline;
const properties = pixiDevtoolsProperties(legacy);
legacy.properties = properties;
// win.__PIXI_INSPECTOR_LEGACY__.viewport = (${pixiDevtoolsViewport.toString()}(win.__PIXI_INSPECTOR_LEGACY__));
// win.__PIXI_INSPECTOR_LEGACY__.overlay = (${pixiDevtoolsOverlay.toString()}(win.__PIXI_INSPECTOR_LEGACY__));
// win.__PIXI_INSPECTOR_LEGACY__.clickToSelect = (${pixiDevtoolsClickToSelect.toString()}(win.__PIXI_INSPECTOR_LEGACY__));

const legacyController = {
  children: [],
  sync(out) {
    if (this.children?.length === 0) {
      out.appends.push(
        {
          component: "SceneGraphLegacy",
          props: {},
          value: outline.tree(),
          node: {
            sync(out) {
              out.value = outline.tree();
            },
            events: {
              onexpand: (path) => outline.expand(path as string[]),
              oncollapse: (path) => outline.collapse(path as string[]),
              onactivate: (path) => outline.activate(path as string[]),
              onselectable: (path) => outline.selectable(path as string[]),
              onunselectable: (path) => outline.unselectable(path as string[]),
              onshow: (path) => outline.show(path as string[]),
              onhide: (path) => outline.hide(path as string[]),
              onlog: (path) => outline.log(path as string[]),
              onmouseenter: (path) => outline.highlight(path as string[]),
              onmouseleave: () => outline.highlight([]),
            },
          },
          children: [
            {
              component: "SearchField",
              value: outline.query,
              props: { label: "Search" },
              node: {
                sync(out) {
                  out.value = outline.query;
                },
                events: {
                  setValue(value: TreeValue) {
                    outline.query = value as string;
                    return outline.query.length >= 2 ? 1 : 0;
                  },
                },
              },
            },
          ],
        },
        {
          component: "PropertiesLegacy",
          value: properties.values(),
          props: {},
          node: {
            sync(out) {
              out.value = properties.values();
            },
            setValue(value: TreeValue) {
              const event = value as { property: string; value: number };
              properties.set(event.property, event.value);
            },
            events: {
              onactivate: (tab) => {
                properties.activate(tab as PropertyTab);
              },
            },
          },
        },
      );
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
