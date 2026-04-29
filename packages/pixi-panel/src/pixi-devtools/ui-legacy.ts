import type { TreeValue } from "ui-protocol/src/types";
import type { NodeProperties, PixiDevtools } from "../types";
import pixiDevtools from "./pixiDevtools";
import pixiDevtoolsOutline from "./pixiDevtoolsOutline";
import pixiDevtoolsSelection from "./pixiDevtoolsSelection";
import pixiDevtoolsProperties from "./pixiDevtoolsProperties";
import pixiDevtoolsViewport from "./pixiDevtoolsViewport";
import pixiDevtoolsOverlay from "./pixiDevtoolsOverlay";
import pixiDevtoolsClickToSelect from "./pixiDevtoolsClickToSelect";
import refreshController from "ui-protocol/src/controllers/refreshController";
import defineUI, { type UIProtocolInit } from "ui-protocol/src/svelte/defineUI";
import switchController from "ui-protocol/src/controllers/switchController";
import ifController from "ui-protocol/src/controllers/ifController";
import pixiApplicationTab from "./pixiApplicationTab";
import { evalListen } from "ui-protocol/src/evalBridge";
import rootController from "ui-protocol/src/controllers/rootController";
import session from "./session";

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
win.__UI_PROTOCOL__ = win.__UI_PROTOCOL__ ?? {};
evalListen(
  "pixi",
  rootController(() => [
    refreshController({
      interval: 2_000,
      children: [
        ifController(
          () => {
            if (legacy.renderer() ?? legacy.root()) {
              return false; // no patch needed
            }
            if (win.PIXI?.[patched]) {
              return false; // already patched
            }
            return !!win.PIXI; // show patch option when PIXI is available
          },
          () => initPatchEngine(),
          () => initLegacyUI(),
        ),
      ],
    }),
  ]),
);

const patched = Symbol("patched");

export function initLegacyUI() {
  const searchInput = defineUI({
    component: "SearchInput",
    getValue: () => outline.query,
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
              refreshController({
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
            children: [instructionsFallback(initPropertyTabs())],
          },
        ],
      },
    ],
  });
}

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
      refreshController({
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
  const appRef = { value: legacy.app() };
  const allTabs = {
    scene: { icon: "scene", label: "Scene Properties" },
    object: { icon: "object", label: "Object Properties" },
    text: { icon: "text", label: "Text Properties" },
  } as const;
  type TabKey = keyof typeof allTabs;

  let previous$pixi: any = win.$pixi;
  let definitions: ReturnType<typeof properties.definitions>;
  let preferredTab: TabKey = "text";
  let availableTabs: TabKey[] = [];
  let activeTab: TabKey | undefined;

  function detect() {
    definitions = properties.definitions();
    const sceneVisible =
      appRef.value?.ticker || appRef.value?.renderer?.background?.color;
    availableTabs = sceneVisible ? ["scene"] : [];
    for (const key of Object.keys(allTabs)) {
      const tab = key as keyof typeof definitions;
      if (definitions[tab] && definitions[tab].length !== 0) {
        availableTabs.push(tab);
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
        availableTabs.includes(key as TabKey),
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

  type PropertyInit = Extract<
    UIProtocolInit,
    {
      component: "PixiObjectProperties" | "PixiTextProperties";
    }
  >;
  function initPanel(tab: "object" | "text"): Omit<PropertyInit, "component"> {
    return {
      props: { expanded },
      getValue: () => {
        const properties: NodeProperties = {};
        for (let i = 0; i < definitions[tab].length; i += 1) {
          const { key, get } = definitions[tab][i];
          properties[key] = get();
        }
        return properties;
      },
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
    };
  }
  return refreshController({
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
              ifController(
                () => activeTab,
                (activeTabRef) =>
                  switchController(() => activeTabRef.value, {
                    scene: () => pixiApplicationTab(appRef),
                    object: () =>
                      defineUI({
                        component: "PixiObjectProperties",
                        ...initPanel("object"),
                      }),
                    text: () =>
                      defineUI({
                        component: "PixiTextProperties",
                        ...initPanel("text"),
                      }),
                  }),
              ),
            ],
          },
        ],
        events: {
          setActive(tab) {
            preferredTab = tab as TabKey;
            detect();
          },
        },
        sync(patch) {
          const nextApp = legacy.app();
          if (previous$pixi === win.$pixi && appRef.value === nextApp) {
            return;
          }
          appRef.value = nextApp;
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

function initPatchEngine() {
  if (session.get("pixi:patchRenderer")) {
    return refreshController({
      interval: 250,
      depth: 1,
      children: [
        {
          component: "Warning",
          props: { message: "Attempting to patch..." },
        },
      ],
      sync() {
        patchRenderEngine();
      },
    });
  }
  return defineUI({
    component: "Fragment",
    children: [
      {
        component: "Warning",
        props: {
          message:
            '"Patch render engine" is available. This type of Devtools connection is less reliable',
        },
      },
      {
        component: "Box",
        props: { padding: 8 },
        children: [
          {
            component: "Button",
            props: { label: "Patch render engine" },
            events: {
              onclick() {
                patchRenderEngine();
                session.set("pixi:patchRenderer", true);
                return Infinity;
              },
            },
          },
        ],
      },
      {
        component: "PixiInstructions",
        events: {
          copy(text) {
            win.copy(text);
          },
        },
      },
    ],
  });
}

function patchRenderEngine() {
  if (win.PIXI) {
    patchPixi(win.PIXI);
  } else {
    console.error("Patching failed");
  }
}
function patchPixi(PIXI: any) {
  if (PIXI[patched]) {
    return;
  }
  PIXI[patched] = true;
  for (const prop of ["Renderer", "WebGLRenderer"]) {
    const Renderer = PIXI[prop];
    if (Renderer) {
      const { render } = Renderer.prototype;
      Renderer.prototype.render = function pixiDevtoolsRender(...args: any[]) {
        win.__PATCHED_RENDERER__ = this;
        win.__PATCHED_RENDERER_STAGE__ = args[0];
        return render.call(this, ...args) as unknown;
      };
    }
  }
}

function instructionsFallback(child: UIProtocolInit) {
  let timer: number | undefined;
  let instructions = false;

  return ifController(
    () => {
      if (legacy.root()) {
        instructions = false;
        clearTimeout(timer);
        timer = undefined;
        return false;
      }
      if (!timer) {
        timer = window.setTimeout(() => {
          instructions = true;
        }, 2_000);
      }
      return instructions;
    },
    {
      component: "PixiInstructions",
      events: {
        copy(text) {
          win.copy(text);
        },
      },
    },
    child,
  );
}
