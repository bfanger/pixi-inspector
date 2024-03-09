/**
 * https://pixijs.com/examples/events/interactivity
 */
import { Application, Assets, Sprite, Texture } from "pixi.js";

(async () => {
  const app = new Application();

  await app.init({ preference: "webgl", resizeTo: window });

  document.body.appendChild(app.canvas);

  await Assets.load([
    "https://pixijs.com/assets/bg_button.jpg",
    "https://pixijs.com/assets/button.png",
    "https://pixijs.com/assets/button_down.png",
    "https://pixijs.com/assets/button_over.png",
  ]);

  const background = Sprite.from("https://pixijs.com/assets/bg_button.jpg");

  background.width = app.screen.width;
  background.height = app.screen.height;

  app.stage.addChild(background);

  const textureButton = Texture.from("https://pixijs.com/assets/button.png");
  const textureButtonDown = Texture.from(
    "https://pixijs.com/assets/button_down.png",
  );
  const textureButtonOver = Texture.from(
    "https://pixijs.com/assets/button_over.png",
  );

  type Button = Sprite & { isdown: boolean; isOver: boolean };
  const buttons = [];

  const buttonPositions = [175, 75, 655, 75, 410, 325, 150, 465, 685, 445];

  for (let i = 0; i < 5; i += 1) {
    const button = new Sprite(textureButton);

    button.anchor.set(0.5);
    button.x = buttonPositions[i * 2];
    button.y = buttonPositions[i * 2 + 1];

    button.eventMode = "static";
    button.cursor = "pointer";

    button
      .on("pointerdown", onButtonDown)
      .on("pointerup", onButtonUp)
      .on("pointerupoutside", onButtonUp)
      .on("pointerover", onButtonOver)
      .on("pointerout", onButtonOut);

    app.stage.addChild(button);

    buttons.push(button);
  }

  buttons[0].scale.set(1.2);
  buttons[2].rotation = Math.PI / 10;
  buttons[3].scale.set(0.8);
  buttons[4].scale.set(0.8, 1.2);
  buttons[4].rotation = Math.PI;

  function onButtonDown(this: Button) {
    this.isdown = true;
    this.texture = textureButtonDown;
    this.alpha = 1;
  }

  function onButtonUp(this: Button) {
    this.isdown = false;
    if (this.isOver) {
      this.texture = textureButtonOver;
    } else {
      this.texture = textureButton;
    }
  }

  function onButtonOver(this: Button) {
    this.isOver = true;
    if (this.isdown) {
      return;
    }
    this.texture = textureButtonOver;
  }

  function onButtonOut(this: Button) {
    this.isOver = false;
    if (this.isdown) {
      return;
    }
    this.texture = textureButton;
  }

  (globalThis as any).__PIXI_APP__ = app; // eslint-disable-line
})();
