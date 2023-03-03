import type { PixiDevtools } from "../types";

export default function pixiDevtoolsViewport(devtools: PixiDevtools) {
  return {
    element() {
      if (devtools.app) {
        return devtools.app.view as HTMLCanvasElement;
      }
      if (devtools.game) {
        return devtools.game.canvas;
      }
      throw new Error("Not connected");
    },
  };
}
