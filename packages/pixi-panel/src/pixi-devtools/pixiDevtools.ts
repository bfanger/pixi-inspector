import type { Game, GameObjects, Scene } from "phaser";
import type { Application, Container, ICanvas, Renderer } from "pixi.js";
import type { UniversalNode } from "../types";

type EventDetail = {
  activate: UniversalNode | undefined;
};

export default function pixiDevtools() {
  const eventTarget = new EventTarget();
  const win = window as any;
  let detectedVersion: number | undefined | null = null;

  let mode: "PIXI" | "PHASER" | undefined;

  function getGlobal(varname: string): any {
    if (win[varname]) {
      return win[varname];
    }
    if (win.frames) {
      for (let i = 0; i < win.frames.length; i += 1) {
        try {
          if (win.frames[i][varname]) {
            return win.frames[i][varname];
          }
        } catch {
          // access to iframe was denied
        }
      }
    }
    return undefined;
  }

  return {
    app(): Application | undefined {
      return getGlobal("__PIXI_APP__") as Application | undefined;
    },
    root(): Container | Scene | undefined {
      const stage = getGlobal("__PIXI_STAGE__");
      if (stage) {
        return stage as Container;
      }
      const app = getGlobal("__PIXI_APP__") as Application | undefined;
      if (app) {
        return app.stage;
      }
      const game = getGlobal("__PHASER_GAME__") as Game | undefined;
      if (game) {
        if (game.scene.scenes.length === 1) {
          return game.scene.scenes[0];
        }
        return game.scene as any as Scene;
      }
      const renderer = getGlobal("__PIXI_RENDERER__");
      if (renderer) {
        return (renderer.lastObjectRendered ??
          renderer._lastObjectRendered) as Container;
      }
      const patched = getGlobal("__PATCHED_RENDERER__");
      if (patched) {
        return (patched.lastObjectRendered ??
          patched._lastObjectRendered) as Container;
      }
      return undefined;
    },
    renderer(): Renderer<ICanvas> | Game | undefined {
      const renderer = getGlobal("__PIXI_RENDERER__");
      if (renderer) {
        return renderer as Renderer<ICanvas>;
      }
      const app = getGlobal("__PIXI_APP__");
      if (app) {
        mode = "PIXI";
        return app.renderer as Renderer<ICanvas>;
      }
      const game = getGlobal("__PHASER_GAME__");
      if (game) {
        mode = "PHASER";
        return game as Game;
      }
      const patched = getGlobal("__PATCHED_RENDERER__");
      if (patched) {
        return patched as Renderer<ICanvas>;
      }
      return undefined;
    },
    canvas(): ICanvas | HTMLCanvasElement | undefined {
      const renderer = this.renderer();
      if (renderer) {
        if ("canvas" in renderer) {
          return renderer.canvas;
        }
        if ("view" in renderer) {
          return (renderer as any).view as HTMLCanvasElement;
        }
      }
      return undefined;
    },

    childrenOf(node: UniversalNode | Scene): UniversalNode[] | undefined {
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
        return node.scenes;
      }
      if ("emitters" in node) {
        // node is GameObjects.Particles.ParticleEmitterManager (Removed in Phaser 3.60)
        return (node as any).emitters.list as UniversalNode[];
      }
      if ("alive" in node) {
        // node is GameObjects.Particles.ParticleEmitter
        return (node as any).alive as UniversalNode[];
      }
      return undefined;
    },
    parentOf(node: UniversalNode) {
      if ("parent" in node) {
        return (node as Container).parent;
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
    version() {
      if (detectedVersion !== null) {
        return detectedVersion;
      }
      const root = this.root();
      if (root) {
        detectedVersion = undefined;
        if ("getLocalBounds" in root) {
          const bounds = root.getLocalBounds();
          if ("containsPoint" in bounds) {
            detectedVersion = 8;
          }
        }
      }
      return detectedVersion ?? undefined;
    },
    /**
     * inVersionRange(8, 9) // true if the Pixi.js version is 8 or higher but lower than 9
     */
    inVersionRange(start: number, stop?: number) {
      const version = this.version();
      if (version === undefined || version === -1) {
        return false;
      }
      if (version < start) {
        return false;
      }
      if (stop === undefined || version < stop) {
        return true;
      }
      return false;
    },
    on<T extends keyof EventDetail>(
      event: T,
      callback: (detail: EventDetail[T]) => void,
    ) {
      const listener = (e: any) => {
        callback(e.detail);
      };
      eventTarget.addEventListener(`pixi:${event}`, listener);
      return () => eventTarget.removeEventListener(`pixi:${event}`, listener);
    },
    once<T extends keyof EventDetail>(
      event: T,
      callback: (detail: EventDetail[T]) => void,
    ) {
      const off = this.on(event, (e) => {
        off();
        callback(e);
      });
      return off;
    },
    dispatchEvent<T extends keyof EventDetail>(
      event: T,
      detail: EventDetail[T],
    ) {
      eventTarget.dispatchEvent(new CustomEvent(`pixi:${event}`, { detail }));
    },
  };
}
