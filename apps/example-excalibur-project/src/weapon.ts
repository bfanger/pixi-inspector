import type { Engine } from "excalibur";
import { Actor, Animation, Keys, SpriteSheet } from "excalibur";
import { Resources } from "./resources";

export class Weapon extends Actor {
  constructor() {
    super({
      name: "Weapon",
      x: 0,
      y: 8,
      width: 32,
      height: 32,
    });
  }

  onInitialize(): void {
    const sheet = SpriteSheet.fromImageSource({
      image: Resources.SwordPng,
      grid: {
        spriteWidth: 32,
        spriteHeight: 32,
        rows: 8,
        columns: 4,
      },
    });
    this.graphics.add(
      "down-chop",
      new Animation({
        frames: [
          {
            graphic: sheet.getSprite(2, 4),
            duration: 150,
          },
          {
            graphic: sheet.getSprite(3, 4),
            duration: 100,
          },
          {
            graphic: sheet.getSprite(0, 6),
            duration: 100,
          },
        ],
      }),
    );
    this.graphics.add("down-idle", sheet.getSprite(0, 6));
  }

  onPreUpdate(engine: Engine): void {
    this.graphics.use("down-idle");

    if (engine.input.keyboard.isHeld(Keys.Space)) {
      this.graphics.use("down-chop");
    }
  }
}
