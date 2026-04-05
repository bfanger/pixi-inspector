import type { TreeInit, TreeValue } from "ui-protocol/src/types";
import type { PixiDevtools, PropertyTab, PropertyTabState } from "../types";
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
  const searchInput: TreeInit = {
    component: "SearchInput",
    value: outline.query,
    props: { label: "Search" },
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
  };

  let direction = "row";
  return {
    component: "Fragment",
    children: [
      {
        component: "SplitPanels",
        props: { direction: "column" },
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
        children: [
          {
            component: "SplitPanel",
            props: { minWidth: 200, minHeight: 100, size: 2 },
            children: [
              refreshNode({
                interval: 1_000,
                children: [initSceneGraph([searchInput])],
                sync(patch) {
                  if (outline.query.length === 0) {
                    patch.props = { interval: 1_000 };
                  } else {
                    patch.props = { interval: 5_000 };
                  }
                },
              }),
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
            children: [initProperties()],
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
    children: [
      ...children,
      refreshNode({
        interval: 100,
        refresh() {
          if (previous$pixi !== win.$pixi) {
            return 3;
          }
          return 0;
        },
      }),
    ],
  };
}

function initProperties(): TreeInit {
  let previous$pixi: any = win.$pixi;
  let propertyTabState: PropertyTabState = properties.values();
  let skipNext = true;
  let previousTab = "";

  const availableTabs = {
    scene: { icon: "scene", label: "Scene Properties" },
    object: { icon: "object", label: "Object Properties" },
    text: { icon: "text", label: "Text Properties" },
  } as const;

  function enabledTabs(tabs: PropertyTab[]) {
    return Object.fromEntries(
      Object.entries(availableTabs).filter(([key]) =>
        tabs.includes(key as PropertyTab),
      ),
    );
  }
  const expanded = {
    ticker: true,
    renderer: true,
    transform: true,
    transformOrigin: true,
    skewDimensions: true,
    visibility: true,
    rendering: true,
    interactive: true,
    font: true,
    alignment: true,
    spacing: true,
    wordWrap: true,
    dropShadow: true,
    stroke: true,
  };
  const propertyComponents = {
    scene: "PixiSceneProperties",
    object: "PixiObjectProperties",
    text: "PixiTextProperties",
  } as const;

  function initPropertyPanel(): TreeInit {
    return {
      component: propertyComponents[propertyTabState.active],
      props: { expanded },
      value: propertyTabState.properties,
      setValue(data) {
        const { property, value } = data as {
          property: string;
          value: number;
        };
        properties.set(property, value);
        return 0;
      },
      events: {
        setExpanded(key, value) {
          expanded[key as keyof typeof expanded] = value as boolean;
        },
      },
      sync(out) {
        if (skipNext) {
          skipNext = false;
        } else {
          propertyTabState = properties.values();
        }
        out.value = propertyTabState.properties;
      },
    };
  }

  return refreshNode({
    interval: 100,
    children: [
      {
        component: "Tabs",
        props: {
          tabs: enabledTabs(propertyTabState.tabs),
          active: propertyTabState.active,
        },
        children: [
          {
            component: "Box",
            props: { padding: 8, gap: 1 },
            children: [],
            sync(out) {
              if (propertyTabState && propertyTabState.active !== previousTab) {
                previousTab = propertyTabState.active;
                if (propertyTabState.tabs.length === 0) {
                  out.truncate = 0;
                } else if (this.children?.length === 0) {
                  out.appends.push(initPropertyPanel());
                } else {
                  out.replacements.push({
                    index: 0,
                    ...initPropertyPanel(),
                  });
                }
              }
            },
          },
        ],
        events: {
          setActive(tab) {
            properties.activate(tab as PropertyTab);
          },
        },
        sync(out) {
          if (previous$pixi !== win.$pixi) {
            propertyTabState = properties.values();
            skipNext = true;
            // Detect which tabs are available for the new object
            previous$pixi = win.pixi;
            out.props = {
              tabs: enabledTabs(propertyTabState.tabs),
              active: propertyTabState.active,
            };
          }
        },
      },
    ],
  });
}
