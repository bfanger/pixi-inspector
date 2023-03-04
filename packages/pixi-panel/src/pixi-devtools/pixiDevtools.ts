import type { Application, Container, DisplayObject } from "pixi.js";
import type { Game, GameObjects, Scene } from "phaser";
import type { UniversalNode } from "../types";

type EventDetail = {
  connect: { app: Application | undefined; game: Game | undefined };
  disconnect: undefined;
  activate: UniversalNode | undefined;
};

export default function pixiDevtools() {
  const eventTarget = new EventTarget();

  return {
    app: undefined as Application | undefined,
    game: undefined as Game | undefined,
    root(): Container | Scene {
      if (this.app) {
        return this.app.stage;
      }
      if (this.game) {
        return this.game.scene.scenes[0];
      }
      throw new Error("Not connected");
    },
    childrenOf(node: UniversalNode | Scene): Array<UniversalNode> | undefined {
      if (this.app) {
        return (node as Container).children;
      }
      if ("children" in node) {
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
        // GameObjects.Particles.ParticleEmitter
        return (node as any).alive;
      }
      return undefined;
    },
    parentOf(node: UniversalNode) {
      if (this.app) {
        return (node as DisplayObject).parent;
      }
      if (this.game) {
        const container = (node as GameObjects.GameObject).parentContainer;
        if (container === null) {
          return (node as GameObjects.GameObject).scene;
        }
        return container;
      }
      return undefined;
    },
    active(): UniversalNode | undefined {
      return (window as any).$pixi;
    },
    activate(node?: UniversalNode) {
      (window as any).$pixi = node;
      this.dispatchEvent("activate", node);
    },
    disconnect() {
      if (this.app || this.game) {
        this.dispatchEvent("disconnect", undefined);
      }
      this.app = undefined;
      this.game = undefined;
    },
    reconnect() {
      const win = window as any;
      /* eslint-disable no-underscore-dangle */
      const app = win.__PIXI_APP__ ?? win.frames[0]?.__PIXI_APP__;
      const game = win.__PHASER_GAME__ ?? win.frames[0]?.__PHASER_GAME__;
      /* eslint-enable no-underscore-dangle */
      if (!app && !game) {
        return false;
      }
      if (this.app && this.app !== app) {
        this.disconnect();
      }
      if (this.game && this.game !== game) {
        this.disconnect();
      }
      this.app = app;
      this.game = game;
      win.$pixi = this.root();
      this.dispatchEvent("connect", { app, game });
      return true;
    },
    isDisplayObject(node: UniversalNode): node is DisplayObject {
      return !!this.app;
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