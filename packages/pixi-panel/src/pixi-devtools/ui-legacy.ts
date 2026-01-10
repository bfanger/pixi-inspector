import type { TreeInit, TreeValue } from "ui-protocol/src/types";
import type { PixiDevtools, PropertyTab } from "../types";
import pixiDevtools from "./pixiDevtools";
import pixiDevtoolsOutline from "./pixiDevtoolsOutline";
import pixiDevtoolsSelection from "./pixiDevtoolsSelection";
import pixiDevtoolsProperties from "./pixiDevtoolsProperties";
import pixiDevtoolsViewport from "./pixiDevtoolsViewport";
import pixiDevtoolsOverlay from "./pixiDevtoolsOverlay";
import pixiDevtoolsClickToSelect from "./pixiDevtoolsClickToSelect";
import refreshNode from "ui-protocol/src/refreshNode";

const legacy = pixiDevtools() as PixiDevtools;
legacy.selection = pixiDevtoolsSelection();
const outline = pixiDevtoolsOutline(legacy);
legacy.outline = outline;
const properties = pixiDevtoolsProperties(legacy);
legacy.properties = properties;
legacy.viewport = pixiDevtoolsViewport(legacy);
legacy.overlay = pixiDevtoolsOverlay(legacy);
pixiDevtoolsClickToSelect(legacy);

const win = window as any;
win.__PIXI_DEVTOOLS_LEGACY__ = function legacyInit(): TreeInit {
  const searchField: TreeInit = {
    component: "SearchField",
    value: outline.query,
    props: { label: "Search" },
    node: {
      sync(patch) {
        patch.value = outline.query;
      },
      events: {
        setValue: [
          (value: TreeValue) => {
            outline.query = value as string;
            return 2;
          },
          { debounce: 300 },
        ],
        onclear() {
          outline.query = "";
          return 2;
        },
      },
    },
  };

  let direction = "row";
  return {
    component: "Fragment",
    children: [
      {
        component: "SplitPanels",
        props: { direction: "column" },
        node: {
          sync(patch) {
            patch.props = { direction };
          },
          events: {
            onresize: [
              (details) => {
                const size = details as { width: number; height: number };
                direction = size.width > 500 ? "row" : "column";
              },
              { throttle: 100 },
            ],
          },
        },
        children: [
          {
            component: "SplitPanel",
            props: { minWidth: 200, minHeight: 100, size: 2 },
            node: {},
            children: [
              {
                component: "Refresh",
                props: { interval: 1_000 },
                node: refreshNode({
                  sync(patch) {
                    if (outline.query.length === 0) {
                      patch.props = { interval: 1_000 };
                    } else {
                      patch.props = { interval: 5_000 };
                    }
                  },
                }),
                children: [initSceneGraph([searchField])],
              },
            ],
          },
          {
            component: "SplitPanel",
            props: {
              minWidth: 200,
              minHeight: 200,
              maxHeight: 680,
              size: 3,
            },
            node: {},
            children: [
              {
                component: "Refresh",
                props: { interval: 200 },
                node: refreshNode(),
                children: [
                  {
                    component: "PixiProperties",
                    value: properties.values(),
                    node: {
                      sync(out) {
                        out.value = properties.values();
                      },
                      setValue(value: TreeValue) {
                        const event = value as {
                          property: string;
                          value: number;
                        };
                        properties.set(event.property, event.value);
                      },
                      events: {
                        onactivate: (tab) => {
                          properties.activate(tab as PropertyTab);
                        },
                      },
                    },
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  } satisfies TreeInit;
};

function initSceneGraph(children: TreeInit[]): TreeInit {
  let previous$pixi: any = undefined;
  return {
    component: "PixiSceneGraph",
    value: outline.tree(),
    node: {
      sync(patch) {
        if (previous$pixi !== win.$pixi) {
          if (win.$pixi) {
            outline.expandParentsFor(win.$pixi);
          }
          previous$pixi = win.$pixi;
        }
        patch.value = outline.tree();
      },
      events: {
        onexpand: (path) => outline.expand(path as string[]),
        oncollapse: (path) => outline.collapse(path as string[]),
        onactivate: (path) => {
          outline.activate(path as string[]);
          return 3;
        },
        onselectable: (path) => outline.selectable(path as string[]),
        onunselectable: (path) => outline.unselectable(path as string[]),
        onshow: (path) => {
          outline.show(path as string[]);
          return 3;
        },
        onhide: (path) => {
          outline.hide(path as string[]);
          return 3;
        },
        onlog: (path) => outline.log(path as string[]),
        onmouseenter: (path) => outline.highlight(path as string[]),
        onmouseleave: () => outline.highlight([]),
      },
    },
    children: [
      ...children,
      {
        component: "Refresh",
        props: { interval: 100 },
        node: refreshNode({
          refresh() {
            if (previous$pixi !== win.$pixi) {
              previous$pixi = win.$pixi;
              return 3;
            }
            return 0;
          },
        }),
      },
    ],
  };
}
