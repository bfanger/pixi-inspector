import type { Game, GameObjects, Scene } from "phaser";
import type { Application, Container, ICanvas, Renderer } from "pixi.js";
import type { UniversalNode } from "../types";

export default function pixiDevtools() {
  const win = window as any;
  let detectedVersion: number | undefined | null = null;

  let mode: "PIXI" | "PHASER" | undefined;

  function getGlobal<T>(varname: string): T | undefined {
    return win[varname] as T;
  }

  return {
    app(): Application | undefined {
      return (
        getGlobal<Application>("__PIXI_APP__") ??
        getGlobal<{ app: Application }>("__PIXI_DEVTOOLS__")?.app
      );
    },

    root(): Container | Scene | undefined {
      const stage = getGlobal<Container>("__PIXI_STAGE__");
      if (stage) {
        return stage;
      }
      const app = this.app();
      if (app) {
        return app.stage;
      }
      const game = getGlobal<Game>("__PHASER_GAME__");
      if (game) {
        if (game.scene.scenes.length === 1) {
          return game.scene.scenes[0];
        }
        return game.scene as any as Scene;
      }
      const gameDebug = getGlobal<Game>("PHASER_GAME");
      if (gameDebug) {
        if (gameDebug.scene.scenes.length === 1) {
          return gameDebug.scene.scenes[0];
        }
        return gameDebug.scene as any as Scene;
      }
      const stageFromPatched = getGlobal<Container>(
        "__PATCHED_RENDERER_STAGE__",
      );
      if (stageFromPatched) {
        return stageFromPatched;
      }
      const officialHook = getGlobal<{ stage?: Container }>(
        "__PIXI_DEVTOOLS_WRAPPER__",
      );
      if (officialHook?.stage) {
        return officialHook.stage;
      }
      const officialDevtools = getGlobal<{ stage?: Container }>(
        "__PIXI_DEVTOOLS__",
      );
      if (officialDevtools?.stage) {
        return officialDevtools.stage;
      }
      const renderer = this.renderer() as {
        lastObjectRendered?: Container;
        _lastObjectRendered?: Container;
      };
      if (renderer?.lastObjectRendered) {
        return renderer.lastObjectRendered;
      }
      if (renderer?._lastObjectRendered) {
        return renderer._lastObjectRendered;
      }
      return undefined;
    },

    renderer(): Renderer<ICanvas> | Game | undefined {
      const renderer = getGlobal<Renderer<ICanvas>>("__PIXI_RENDERER__");
      if (renderer) {
        return renderer;
      }
      const app = this.app();
      if (app) {
        mode = "PIXI";
        return app.renderer as Renderer<ICanvas>;
      }
      const game = getGlobal<Game>("__PHASER_GAME__");
      if (game) {
        mode = "PHASER";
        return game;
      }
      const gameDebug = getGlobal<Game>("PHASER_GAME");
      if (gameDebug) {
        mode = "PHASER";
        return gameDebug;
      }
      const patched = getGlobal("__PATCHED_RENDERER__");
      if (patched) {
        return patched as Renderer<ICanvas>;
      }
      const officialHook = getGlobal<{ renderer?: Renderer<ICanvas> }>(
        "__PIXI_DEVTOOLS_WRAPPER__",
      );
      if (officialHook?.renderer) {
        return officialHook.renderer;
      }
      const officialDevtools = getGlobal<{ renderer?: Renderer<ICanvas> }>(
        "__PIXI_DEVTOOLS__",
      );
      if (officialDevtools?.renderer) {
        return officialDevtools.renderer;
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
  };
}
