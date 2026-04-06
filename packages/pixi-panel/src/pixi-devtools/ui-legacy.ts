import type { TreeValue } from "ui-protocol/src/types";
import type { PixiDevtools, PropertyTab, PropertyTabState } from "../types";
import pixiDevtools from "./pixiDevtools";
import pixiDevtoolsOutline from "./pixiDevtoolsOutline";
import pixiDevtoolsSelection from "./pixiDevtoolsSelection";
import pixiDevtoolsProperties from "./pixiDevtoolsProperties";
import pixiDevtoolsViewport from "./pixiDevtoolsViewport";
import pixiDevtoolsOverlay from "./pixiDevtoolsOverlay";
import pixiDevtoolsClickToSelect from "./pixiDevtoolsClickToSelect";
import refreshNode from "ui-protocol/src/refreshNode";
import defineUI, { type UIProtocolInit } from "ui-protocol/src/svelte/defineUI";

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
win.__PIXI_DEVTOOLS_LEGACY__ = function legacyInit() {
  const searchInput = defineUI({
    component: "SearchInput",
    value: outline.query,
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
  });

  let direction: "row" | "column" = "row";
  return defineUI({
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
  });
};

function initSceneGraph(children: UIProtocolInit[]): UIProtocolInit {
  let previous$pixi: any = undefined;
  return defineUI({
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
      onexpand: (path) => outline.expand(path),
      oncollapse: (path) => outline.collapse(path),
      onactivate: (path) => {
        outline.activate(path);
        return 3;
      },
      onselectable: (path) => outline.selectable(path),
      onunselectable: (path) => outline.unselectable(path),
      onshow: (path) => {
        outline.show(path);
        return 3;
      },
      onhide: (path) => {
        outline.hide(path);
        return 3;
      },
      onlog: (path) => outline.log(path),
      onmouseenter: (path) => outline.highlight(path),
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
  });
}

function initProperties(): UIProtocolInit {
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

  function initPropertyPanel(): UIProtocolInit {
    const panel = defineUI({
      component: "PixiObjectProperties",
      props: { expanded },
      value: propertyTabState.properties!,
      setValue({ property, value }) {
        properties.set(property, value);
        return 0;
      },
      events: {
        setExpanded(key, value) {
          expanded[key as keyof typeof expanded] = value;
        },
      },
      sync(patch) {
        if (skipNext) {
          skipNext = false;
        } else {
          propertyTabState = properties.values();
        }
        patch.value = propertyTabState.properties;
      },
    });
    panel.component = propertyComponents[propertyTabState.active] as any;
    return panel as UIProtocolInit;
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
            sync(patch) {
              if (propertyTabState && propertyTabState.active !== previousTab) {
                previousTab = propertyTabState.active;
                if (propertyTabState.tabs.length === 0) {
                  patch.truncate = 0;
                } else if (this.children?.length === 0) {
                  patch.appends.push(initPropertyPanel());
                } else {
                  patch.replacements.push({
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
        sync(patch) {
          if (previous$pixi !== win.$pixi) {
            propertyTabState = properties.values();
            skipNext = true;
            // Detect which tabs are available for the new object
            previous$pixi = win.pixi;
            patch.props = {
              tabs: enabledTabs(propertyTabState.tabs),
              active: propertyTabState.active,
            };
          }
        },
      },
    ],
  });
}
