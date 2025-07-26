/**
 * https://pixijs.com/examples/basic/container
 */
import { Application, Assets, Container, Sprite } from "pixi.js";

(async () => {
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

  const texture = await Assets.load("https://pixijs.com/assets/bunny.png");

  for (let i = 0; i < 25; i += 1) {
    const bunny = new Sprite(texture);

    bunny.x = (i % 5) * 40;
    bunny.y = Math.floor(i / 5) * 40;
    container.addChild(bunny);
  }
  container.children[12].label = "bunny";

  container.x = app.screen.width / 2;
  container.y = app.screen.height / 2;

  container.pivot.x = container.width / 2;
  container.pivot.y = container.height / 2;

  app.ticker.add((time) => {
    container.rotation -= 0.01 * time.deltaTime;
  });

  const exposeApp = true as boolean;
  if (exposeApp) {
    (globalThis as any).__PIXI_APP__ = app;
  } else {
    (globalThis as any).__PIXI_STAGE__ = app.stage;
    (globalThis as any).__PIXI_RENDERER__ = app.renderer;
  }
  (globalThis as any).$pixi = container.children[12];

  import("./ui");
})();
