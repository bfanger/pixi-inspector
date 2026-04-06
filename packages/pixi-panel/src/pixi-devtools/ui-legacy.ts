import type { TreeValue } from "ui-protocol/src/types";
import type { NodeProperties, PixiDevtools, PropertyTab } from "../types";
import pixiDevtools from "./pixiDevtools";
import pixiDevtoolsOutline from "./pixiDevtoolsOutline";
import pixiDevtoolsSelection from "./pixiDevtoolsSelection";
import pixiDevtoolsProperties from "./pixiDevtoolsProperties";
import pixiDevtoolsViewport from "./pixiDevtoolsViewport";
import pixiDevtoolsOverlay from "./pixiDevtoolsOverlay";
import pixiDevtoolsClickToSelect from "./pixiDevtoolsClickToSelect";
import refreshNode from "ui-protocol/src/refreshNode";
import defineUI, { type UIProtocolInit } from "ui-protocol/src/svelte/defineUI";
import switchNode from "ui-protocol/src/switchNode";
import conditionalNode from "ui-protocol/src/conditionalNode";

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
            children: [initPropertyTabs()],
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

function initPropertyTabs(): UIProtocolInit {
  const allTabs = {
    scene: { icon: "scene", label: "Scene Properties" },
    object: { icon: "object", label: "Object Properties" },
    text: { icon: "text", label: "Text Properties" },
  } as const;

  let previous$pixi: any = win.$pixi;
  let definitions: ReturnType<typeof properties.definitions>;
  let preferredTab: PropertyTab = "text";
  let availableTabs: PropertyTab[] = [];
  let activeTab: PropertyTab | undefined;

  function detect() {
    definitions = properties.definitions();
    availableTabs = [];
    for (const key of Object.keys(allTabs)) {
      if (
        definitions[key as PropertyTab] &&
        definitions[key as PropertyTab].length !== 0
      ) {
        availableTabs.push(key as PropertyTab);
      }
    }
    if (availableTabs.includes(preferredTab)) {
      activeTab = preferredTab;
    } else {
      activeTab = availableTabs.at(-1);
    }
  }
  detect();

  function enabledTabs() {
    return Object.fromEntries(
      Object.entries(allTabs).filter(([key]) =>
        availableTabs.includes(key as PropertyTab),
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

  function getValues(tab: PropertyTab) {
    const properties: NodeProperties = {};
    for (let i = 0; i < definitions[tab].length; i += 1) {
      const { key, get } = definitions[tab][i];
      properties[key] = get();
    }
    return properties;
  }

  type PropertyInit = Extract<
    UIProtocolInit,
    {
      component:
        | "PixiObjectProperties"
        | "PixiSceneProperties"
        | "PixiTextProperties";
    }
  >;
  function panelInit(tab: PropertyTab): Omit<PropertyInit, "component"> {
    return {
      props: { expanded },
      value: getValues(tab),
      setValue({ property, value }) {
        const definition = definitions[tab].find(
          (entry) => entry.key === property,
        );
        if (definition) {
          definition.set(value);
        }
      },
      events: {
        setExpanded(key, value) {
          expanded[key as keyof typeof expanded] = value;
        },
      },
      sync(patch) {
        patch.value = getValues(tab);
      },
    };
  }
  return refreshNode({
    interval: 200,
    children: [
      {
        component: "Tabs",
        props: {
          tabs: enabledTabs(),
          active: activeTab,
        },
        children: [
          {
            component: "Box",
            props: { padding: 8, gap: 1 },
            children: [
              conditionalNode(
                () => availableTabs.length > 0,
                switchNode(() => activeTab, {
                  scene: () =>
                    defineUI({
                      component: "PixiSceneProperties",
                      ...panelInit("scene"),
                    }),
                  object: () =>
                    defineUI({
                      component: "PixiObjectProperties",
                      ...panelInit("object"),
                    }),
                  text: () =>
                    defineUI({
                      component: "PixiTextProperties",
                      ...panelInit("text"),
                    }),
                }),
              ),
            ],
          },
        ],
        events: {
          setActive(tab) {
            preferredTab = tab as PropertyTab;
            detect();
          },
        },
        sync(patch) {
          if (previous$pixi === win.$pixi) {
            return;
          }
          previous$pixi = win.$pixi;
          detect();
          patch.props = {
            tabs: enabledTabs(),
            active: activeTab,
          };
        },
      },
    ],
  });
}
