import type { Application } from "pixi.js";

export default function pixiDevtools() {
  const el = document.createElement("div");
  const win = window as any;

  return {
    app: undefined as Application | undefined,
    disconnect() {
      if (this.app) {
        this.dispatch("disconnect");
      }
      this.app = undefined;
    },
    reconnect() {
      const app = win.__PIXI_APP__ ?? win.frames[0]?.__PIXI_APP__;
      if (!app) {
        return false;
      }
      if (this.app && this.app !== app) {
        this.disconnect();
      }
      this.app = app;
      this.dispatch("connect");
      return true;
    },
    on(event: string, callback: () => void) {
      el.addEventListener(`pixi:${event}`, callback);
      return () => el.removeEventListener(`pixi:${event}`, callback);
    },
    dispatch(event: string, detail?: any) {
      el.dispatchEvent(new CustomEvent(`pixi:${event}`, { detail }));
    },
  };
}
