import type { Application, DisplayObject } from "pixi.js";

type EventDetail = {
  connect: Application;
  disconnect: undefined;
  activate: DisplayObject | undefined;
};

export default function pixiDevtools() {
  const el = document.createElement("div");
  const win = window as any;

  return {
    app: undefined as Application | undefined,
    active(): DisplayObject | undefined {
      return (window as any).$pixi;
    },
    activate(node?: DisplayObject) {
      (window as any).$pixi = node;
      this.dispatchEvent("activate", node);
    },
    disconnect() {
      if (this.app) {
        this.dispatchEvent("disconnect");
      }
      this.app = undefined;
    },
    reconnect() {
      // eslint-disable-next-line no-underscore-dangle
      const app = win.__PIXI_APP__ ?? win.frames[0]?.__PIXI_APP__;
      if (!app) {
        return false;
      }
      if (this.app && this.app !== app) {
        this.disconnect();
      }
      this.app = app;
      this.dispatchEvent("connect", app);
      return true;
    },
    on<T extends keyof EventDetail>(
      event: T,
      callback: (detail: EventDetail[T]) => void
    ) {
      const listener = (e) => {
        callback(e.detail);
      };
      el.addEventListener(`pixi:${event}`, listener);
      return () => el.removeEventListener(`pixi:${event}`, listener);
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
      el.dispatchEvent(new CustomEvent(`pixi:${event}`, { detail }));
    },
  };
}
