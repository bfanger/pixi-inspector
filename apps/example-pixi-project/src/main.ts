/**
 *
 * https://pixijs.io/examples/#/demos-basic/container.js
 */
import { Application, Container, Sprite, Texture } from "pixi.js";

const app = new Application({
  width: 640,
  height: 480,
  backgroundColor: 0x1099bb,
  resolution: window.devicePixelRatio || 1,
});
app.view.style.width = "640px";
app.view.style.maxWidth = "100%";
document.body.appendChild(app.view);

const container = new Container();

app.stage.addChild(container);

const texture = Texture.from(
  "https://pixijs.io/examples/examples/assets/bunny.png"
);

for (let i = 0; i < 25; i++) {
  const bunny = new Sprite(texture);
  bunny.anchor.set(0.5);
  bunny.x = (i % 5) * 40;
  bunny.y = Math.floor(i / 5) * 40;
  container.addChild(bunny);
}

container.x = app.screen.width / 2;
container.y = app.screen.height / 2;

container.pivot.x = container.width / 2;
container.pivot.y = container.height / 2;

app.ticker.add((delta) => {
  container.rotation -= 0.01 * delta;
});
window["__PIXI_APP__"] = app;
