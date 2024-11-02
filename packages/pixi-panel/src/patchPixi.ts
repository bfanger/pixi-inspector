import type { BridgeFn } from "./types";

export default async function patchPixi(bride: BridgeFn) {
  await bride(`(${patch.toString()}())`);
  await new Promise((resolve) => {
    setTimeout(resolve, 50);
  }); // Wait for patched render method to execute
}
function patch() {
  let win = window as any;
  function detectInFrames() {
    if (win.PIXI) {
      return;
    }
    if (win.frames) {
      for (let i = 0; i < win.frames.length; i += 1) {
        try {
          if (win.frames[i].PIXI) {
            win = win.frames[i];
            return;
          }
        } catch {
          // access to iframe was denied
        }
      }
    }
  }
  detectInFrames();
  const { PIXI } = win;
  if (!PIXI) {
    console.error("Patching PIXI failed");
    return;
  }
  for (const prop of ["Renderer", "WebGLRenderer"]) {
    const Renderer = PIXI[prop];
    if (Renderer) {
      const { render } = Renderer.prototype;

      Renderer.prototype.render = function pixiDevtoolsRender(...args: any[]) {
        win.__PATCHED_RENDERER__ = this;
        Renderer.prototype.render = render;
        return render.call(this, ...args) as unknown;
      };
      break;
    }
  }
}
