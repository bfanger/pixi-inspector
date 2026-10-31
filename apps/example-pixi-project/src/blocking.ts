/**
 * Starts a Pixi.js app, then blocks the main thread for 5 seconds.
 * Reproduces the "slow main thread during connection" scenario from
 * https://github.com/bfanger/pixi-inspector/issues/144
 */
import { Application, Assets, Container, Sprite } from "pixi.js";

const app = new Application();

await app.init({
  preference: "webgl",
  background: "#1099bb",
  width: 640,
  height: 480,
  resolution: window.devicePixelRatio || 1,
});

const { canvas } = app;
canvas.style.width = "640px";
canvas.style.maxWidth = "100%";
document.body.appendChild(canvas);

const container = new Container();
app.stage.addChild(container);
Assets.load("https://pixijs.com/assets/bunny.png").then((texture) => {
  const bunny = new Sprite(texture);
  container.addChild(bunny);
});

container.x = app.screen.width / 2;
container.y = app.screen.height / 2;
container.pivot.x = container.width / 2;
container.pivot.y = container.height / 2;

(globalThis as any).__PIXI_APP__ = app;

const wait = 10;
const status = document.getElementById("status")!;
status.textContent = `Blocking for ${wait} seconds...`;
setTimeout(() => {
  const start = performance.now();
  let remaining = wait;
  while (remaining > 0) {
    const next = wait - Math.floor((performance.now() - start) / 1000);
    if (next !== remaining) {
      remaining = next;
      console.info(`Blocking… ${remaining}s remaining`);
    }
  }
  if (status) {
    status.textContent = `Idle`;
  }
}, 100);
