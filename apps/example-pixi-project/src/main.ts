/**
 *
 * https://pixijs.io/examples/#/demos-basic/container.js
 */
import {
  Application,
  Container,
  DisplayObject,
  Sprite,
  Texture,
} from "pixi.js";
import {
  Color,
  Container3D,
  Cubemap,
  ImageBasedLighting,
  LightingEnvironment,
  Mesh3D,
} from "pixi3d";

const app = new Application({
  width: 640,
  height: 480,
  backgroundColor: 0x1099bb,
  resolution: window.devicePixelRatio || 1,
});
const canvas = app.view as HTMLCanvasElement;
canvas.style.width = "640px";
canvas.style.maxWidth = "100%";
document.body.appendChild(canvas);

const container = new Container();
const container3D = new Container3D();

LightingEnvironment.main.imageBasedLighting = new ImageBasedLighting(
  Cubemap.fromColors(new Color(0.5, 0.5, 0.5, 1)),
  Cubemap.fromColors(new Color(1, 1, 1, 1)),
);
const box = Mesh3D.createCube();
container3D.addChild(box);
box.z = -5;
box.rotationQuaternion.setEulerAngles(45, 0, 10);

app.stage.addChild(container, <DisplayObject>(<unknown>container3D));

const texture = Texture.from(
  "https://pixijs.io/examples/examples/assets/bunny.png",
);

for (let i = 0; i < 25; i += 1) {
  const bunny = new Sprite(texture);
  bunny.anchor.set(0.5);
  bunny.x = (i % 5) * 40;
  bunny.y = Math.floor(i / 5) * 40;
  container.addChild(bunny);
}
container.children[12].name = "bunny";

container.x = app.screen.width / 2;
container.y = app.screen.height / 2;

container.pivot.x = container.width / 2;
container.pivot.y = container.height / 2;

app.ticker.add((delta) => {
  container.rotation -= 0.01 * delta;
});
const exposeApp = true;
if (exposeApp) {
  (globalThis as any).__PIXI_APP__ = app; // eslint-disable-line
} else {
  (globalThis as any).__PIXI_STAGE__ = app.stage; // eslint-disable-line
  (globalThis as any).__PIXI_RENDERER__ = app.renderer; // eslint-disable-line
}
(globalThis as any).$pixi = container.children[12]; // eslint-disable-line
