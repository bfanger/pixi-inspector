/**
 *
 * https://pixijs.io/examples/#/demos-basic/container.js
 */
import { Application, Container, Sprite, Assets } from "pixi.js";

const app = new Application();
await app.init({
  preference: "webgl",
  width: 640,
  height: 480,
  backgroundColor: 0x1099bb,
  resolution: window.devicePixelRatio || 1,
});
const { canvas } = app;
canvas.style.width = "640px";
canvas.style.maxWidth = "100%";
document.body.appendChild(canvas);

const container = new Container();

app.stage.addChild(container);
const texture = await Assets.load(
  "https://pixijs.io/examples/examples/assets/bunny.png",
);

for (let i = 0; i < 25; i += 1) {
  const bunny = new Sprite(texture);
  bunny.anchor.set(0.5);
  bunny.x = (i % 5) * 40;
  bunny.y = Math.floor(i / 5) * 40;
  container.addChild(bunny);
}
container.children[12].label = "bunny";

container.x = app.screen.width / 2;
container.y = app.screen.height / 2;

container.pivot.x = container.width / 2;
container.pivot.y = container.height / 2;

app.ticker.add((ticker) => {
  container.rotation -= 0.01 * ticker.deltaTime;
});
const exposeApp = true as boolean;
if (exposeApp) {
  (globalThis as any).__PIXI_APP__ = app; // eslint-disable-line
} else {
  (globalThis as any).__PIXI_STAGE__ = app.stage; // eslint-disable-line
  (globalThis as any).__PIXI_RENDERER__ = app.renderer; // eslint-disable-line
}
(globalThis as any).$pixi = container.children[12]; // eslint-disable-line
