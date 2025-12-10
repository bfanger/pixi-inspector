import type { Application, Container } from "pixi.js";
import refreshNode from "ui-protocol/src/refreshNode";
import type { TreeInit } from "ui-protocol/src/types";

const win = window as any;
export default function miniDetector() {
  let previous = detectClient();
  let injected = false;

  return {
    component: "Refresh",
    props: { interval: 250 },
    children: [createNode(previous)],
    node: refreshNode((patch) => {
      const client = detectClient();
      if (client && win.__PIXI_DEVTOOLS_LEGACY__ && !injected) {
        injected = true;
        patch.props = { interval: 2_500 };
        patch.replacements.push({ index: 0, ...createNode(client) });
      } else if (previous !== client) {
        patch.props = { interval: 5_000 };
        patch.replacements.push({ index: 0, ...createNode(client) });
      }
      previous = client;
    }),
  } satisfies TreeInit;
}

function createNode(client: DetectedClient): TreeInit {
  if (!client) {
    return {
      component: "Box",
      props: { gap: 10, padding: 4 },
      children: [
        {
          component: "Box",
          props: { gap: 5 },
          children: [],
          node: {
            sync(patch) {
              const hasPixi = !!getGlobal("PIXI");
              if (hasPixi && this.children!.length === 0) {
                patch.appends.push(
                  {
                    component: "Warning",
                    props: {
                      message:
                        '"Patch render engine" is available. This type of Devtools connection is less reliable',
                    },
                  },
                  {
                    component: "Button",
                    props: { label: "Patch render engine" },
                    node: {
                      events: {
                        onclick() {
                          const PIXI = getGlobal<any>("PIXI");
                          if (!PIXI) {
                            console.error("Patching PIXI failed");
                            return;
                          }
                          for (const prop of ["Renderer", "WebGLRenderer"]) {
                            const Renderer = PIXI[prop];
                            if (Renderer) {
                              const { render } = Renderer.prototype;
                              Renderer.prototype.render =
                                function pixiDevtoolsRender(...args: any[]) {
                                  win.__PATCHED_RENDERER__ = this;
                                  win.__PATCHED_RENDERER_STAGE__ = args[0];
                                  return render.call(this, ...args) as unknown;
                                };
                            }
                          }
                          return 3;
                        },
                      },
                    },
                  },
                );
              }
            },
          },
        },
        { component: "PixiInstructions" },
      ],
    };
  }
  const legacyInit: unknown = win.__PIXI_DEVTOOLS_LEGACY__;
  if (typeof legacyInit === "function") {
    return legacyInit() as TreeInit;
  }
  return {
    component: "PixiInject",
    children: [],
    node: {
      events: {
        onload: () => {
          return Infinity; // Trigger sync after legacy ui controller is injected
        },
      },
    },
  };
}

type DetectedClient = ReturnType<typeof detectClient>;
function detectClient() {
  const app = getGlobal<Application>("__PIXI_APP__");
  if (app) {
    return app;
  }
  const stage = getGlobal<Container>("__PIXI_STAGE__");
  if (stage) {
    return stage;
  }
  const game = getGlobal<unknown>("__PHASER_GAME__");
  if (game) {
    return game;
  }
  const renderer = getGlobal<unknown>("__PIXI_RENDERER__");
  if (renderer) {
    return renderer;
  }
  const patchedRenderer = getGlobal<unknown>("__PATCHED_RENDERER__");
  if (patchedRenderer) {
    return patchedRenderer;
  }
  const officialHook = getGlobal<{ stage: unknown } | undefined>(
    "__PIXI_DEVTOOLS_WRAPPER__",
  );
  if (officialHook?.stage) {
    return officialHook.stage;
  }
  return undefined;
}

function getGlobal<T>(varname: string): T | undefined {
  if (varname in win) {
    return win[varname] as T;
  }
  if (win.frames) {
    for (let i = 0; i < win.frames.length; i += 1) {
      try {
        if (varname in win.frames[i]) {
          return win.frames[i][varname] as T;
        }
      } catch {
        // access to iframe was denied
      }
    }
  }
  return undefined;
}
