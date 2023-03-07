import type {
  Application,
  Container,
  DisplayObject,
  ICanvas,
  IRenderer,
} from "pixi.js";
import type { Game, GameObjects, Scene } from "phaser";
import type { UniversalNode } from "../types";

type EventDetail = {
  connect: { app: Application | undefined; game: Game | undefined };
  disconnect: undefined;
  activate: UniversalNode | undefined;
};

export default function pixiDevtools() {
  const eventTarget = new EventTarget();
  const win = window as any;

  function getGlobal(varname: string) {
    if (win[varname]) {
      return win[varname];
    }
    if (win.frames) {
      for (let i = 0; i < win.frames.length; i += 1) {
        if (win.frames[i][varname]) {
          return win.frames[i][varname];
        }
      }
    }
    return undefined;
  }

  return {
    root(): Container | Scene | undefined {
      const app = getGlobal("__PIXI_APP__");
      if (app) {
        return app.stage;
      }
      const stage = getGlobal("__PIXI_STAGE__");
      if (stage) {
        return stage;
      }
      const game = getGlobal("__PHASER_GAME__");
      if (game) {
        return game.scene.scenes[0];
      }
      const renderer = getGlobal("__PIXI_RENDERER__");
      if (renderer) {
        return renderer.lastObjectRendered;
      }
      return undefined;
    },
    renderer(): IRenderer<ICanvas> | Game | undefined {
      const app = getGlobal("__PIXI_APP__");
      if (app) {
        return app.renderer;
      }
      const game = getGlobal("__PHASER_GAME__");
      if (game) {
        return game;
      }
      const renderer = getGlobal("__PIXI_RENDERER__");
      if (renderer) {
        return renderer;
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
      if ("emitters" in node) {
        return (node as GameObjects.Particles.ParticleEmitterManager).emitters
          .list;
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
    active(): UniversalNode | undefined {
      return win.$pixi;
    },
    activate(node?: UniversalNode) {
      win.$pixi = node;
      this.dispatchEvent("activate", node);
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
