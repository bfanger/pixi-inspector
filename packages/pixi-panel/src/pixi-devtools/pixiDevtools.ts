import type {
  Application,
  Container,
  DisplayObject,
  ICanvas,
  IRenderer,
} from "pixi.js";
import type { Game, GameObjects, Scene, Scenes } from "phaser";
import type { UniversalNode } from "../types";

type EventDetail = {
  activate: UniversalNode | undefined;
};

let mode: "PIXI" | "PHASER" | undefined;
export default function pixiDevtools() {
  const eventTarget = new EventTarget();
  const win = window as any;

  function getGlobal(varname: string) {
    if (win[varname]) {
      return win[varname];
    }
    if (win.frames) {
      for (let i = 0; i < win.frames.length; i += 1) {
        try {
          if (win.frames[i][varname]) {
            return win.frames[i][varname];
          }
        } catch (_) {
          // access to iframe was denied
        }
      }
    }
    return undefined;
  }

  return {
    app(): Application | undefined {
      return getGlobal("__PIXI_APP__");
    },
    root(): Container | Scene | undefined {
      const stage = getGlobal("__PIXI_STAGE__");
      if (stage) {
        return stage;
      }
      const app = getGlobal("__PIXI_APP__");
      if (app) {
        return app.stage;
      }
      const game = getGlobal("__PHASER_GAME__");
      if (game) {
        if (game.scene.scenes.length === 1) {
          return game.scene.scenes[0];
        }
        return game.scene;
      }
      const renderer = getGlobal("__PIXI_RENDERER__");
      if (renderer) {
        return renderer.lastObjectRendered;
      }
      const patched = getGlobal("__PATCHED_RENDERER__");
      if (patched) {
        return patched.lastObjectRendered;
      }
      return undefined;
    },
    renderer(): IRenderer<ICanvas> | Game | undefined {
      const renderer = getGlobal("__PIXI_RENDERER__");
      if (renderer) {
        return renderer;
      }
      const app = getGlobal("__PIXI_APP__");
      if (app) {
        mode = "PIXI";
        return app.renderer;
      }
      const game = getGlobal("__PHASER_GAME__");
      if (game) {
        mode = "PHASER";
        return game;
      }
      const patched = getGlobal("__PATCHED_RENDERER__");
      if (patched) {
        return patched;
      }
      return undefined;
    },
    canvas(): ICanvas | HTMLCanvasElement | undefined {
      const renderer = this.renderer();
      if (renderer) {
        if ("view" in renderer) {
          return renderer.view;
        }
        if ("canvas" in renderer) {
          return renderer.canvas;
        }
      }
      return undefined;
    },

    childrenOf(node: UniversalNode | Scene): Array<UniversalNode> | undefined {
      if ("children" in node) {
        const { children } = node;
        if (Array.isArray(children)) {
          return children;
        }
        return (node as Scene).children.list;
      }
      if ("list" in node) {
        return (node as GameObjects.Container).list;
      }
      if ("scenes" in node) {
        return (node as Scenes.SceneManager).scenes;
      }
      if ("emitters" in node) {
        // node is GameObjects.Particles.ParticleEmitterManager (Removed in Phaser 3.60)
        return (node as any).emitters.list;
      }
      if ("alive" in node) {
        // node is GameObjects.Particles.ParticleEmitter
        return (node as any).alive;
      }
      return undefined;
    },
    parentOf(node: UniversalNode) {
      if ("parent" in node) {
        return (node as DisplayObject).parent;
      }
      if ("parentContainer" in node) {
        const container = (node as GameObjects.GameObject).parentContainer;
        if (container === null) {
          return (node as GameObjects.GameObject).scene;
        }
        return container;
      }
      return undefined;
    },
    isPixi(node: UniversalNode) {
      if (mode === "PIXI") {
        return true;
      }
      if ("parent" in node) {
        return true;
      }
      return false;
    },
    on<T extends keyof EventDetail>(
      event: T,
      callback: (detail: EventDetail[T]) => void
    ) {
      const listener = (e: any) => {
        callback(e.detail);
      };
      eventTarget.addEventListener(`pixi:${event}`, listener);
      return () => eventTarget.removeEventListener(`pixi:${event}`, listener);
    },
    once<T extends keyof EventDetail>(
      event: T,
      callback: (detail: EventDetail[T]) => void
    ) {
      const off = this.on(event, (e) => {
        off();
        callback(e);
      });
      return off;
    },
    dispatchEvent<T extends keyof EventDetail>(
      event: T,
      detail: EventDetail[T]
    ) {
      eventTarget.dispatchEvent(new CustomEvent(`pixi:${event}`, { detail }));
    },
  };
}
