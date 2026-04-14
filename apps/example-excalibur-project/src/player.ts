import type { Engine } from "excalibur";
import {
  Actor,
  Animation,
  CollisionType,
  Color,
  Debug,
  Keys,
  Ray,
  SpriteSheet,
  vec,
  Vector,
} from "excalibur";
import { Resources } from "./resources";

const walkSpeed = 32; // pixels/sec
const frameMs = 200;

export class Player extends Actor {
  constructor(pos: Vector) {
    super({
      pos,
      width: 16,
      height: 16,
      collisionType: CollisionType.Active,
    });
  }

  onInitialize(): void {
    const playerSpriteSheet = SpriteSheet.fromImageSource({
      image: Resources.HeroSpriteSheetPng,
      grid: {
        spriteWidth: 16,
        spriteHeight: 16,
        rows: 8,
        columns: 8,
      },
    });

    const leftIdle = new Animation({
      frames: [
        {
          graphic: playerSpriteSheet.getSprite(0, 1),
          duration: frameMs,
        },
        {
          graphic: playerSpriteSheet.getSprite(1, 1),
          duration: frameMs,
        },
        {
          graphic: playerSpriteSheet.getSprite(2, 1),
          duration: frameMs,
        },
        {
          graphic: playerSpriteSheet.getSprite(3, 1),
          duration: frameMs,
        },
      ],
    });
    this.graphics.add("left-idle", leftIdle);

    const rightIdle = new Animation({
      frames: [
        {
          graphic: playerSpriteSheet.getSprite(0, 2),
          duration: frameMs,
        },
        {
          graphic: playerSpriteSheet.getSprite(1, 2),
          duration: frameMs,
        },
        {
          graphic: playerSpriteSheet.getSprite(2, 2),
          duration: frameMs,
        },
        {
          graphic: playerSpriteSheet.getSprite(3, 2),
          duration: frameMs,
        },
      ],
    });
    this.graphics.add("right-idle", rightIdle);

    const upIdle = new Animation({
      frames: [
        {
          graphic: playerSpriteSheet.getSprite(0, 3),
          duration: frameMs,
        },
        {
          graphic: playerSpriteSheet.getSprite(1, 3),
          duration: frameMs,
        },
        {
          graphic: playerSpriteSheet.getSprite(2, 3),
          duration: frameMs,
        },
        {
          graphic: playerSpriteSheet.getSprite(3, 3),
          duration: frameMs,
        },
      ],
    });
    this.graphics.add("up-idle", upIdle);

    const downIdle = new Animation({
      frames: [
        {
          graphic: playerSpriteSheet.getSprite(0, 0),
          duration: frameMs,
        },
        {
          graphic: playerSpriteSheet.getSprite(1, 0),
          duration: frameMs,
        },
        {
          graphic: playerSpriteSheet.getSprite(2, 0),
          duration: frameMs,
        },
        {
          graphic: playerSpriteSheet.getSprite(3, 0),
          duration: frameMs,
        },
      ],
    });
    this.graphics.add("down-idle", downIdle);

    const leftWalk = new Animation({
      frames: [
        {
          graphic: playerSpriteSheet.getSprite(0, 5),
          duration: frameMs,
        },
        {
          graphic: playerSpriteSheet.getSprite(1, 5),
          duration: frameMs,
        },
        {
          graphic: playerSpriteSheet.getSprite(2, 5),
          duration: frameMs,
        },
        {
          graphic: playerSpriteSheet.getSprite(3, 5),
          duration: frameMs,
        },
      ],
    });
    this.graphics.add("left-walk", leftWalk);

    const rightWalk = new Animation({
      frames: [
        {
          graphic: playerSpriteSheet.getSprite(0, 6),
          duration: frameMs,
        },
        {
          graphic: playerSpriteSheet.getSprite(1, 6),
          duration: frameMs,
        },
        {
          graphic: playerSpriteSheet.getSprite(2, 6),
          duration: frameMs,
        },
        {
          graphic: playerSpriteSheet.getSprite(3, 6),
          duration: frameMs,
        },
      ],
    });
    this.graphics.add("right-walk", rightWalk);

    const upWalk = new Animation({
      frames: [
        {
          graphic: playerSpriteSheet.getSprite(0, 7),
          duration: frameMs,
        },
        {
          graphic: playerSpriteSheet.getSprite(1, 7),
          duration: frameMs,
        },
        {
          graphic: playerSpriteSheet.getSprite(2, 7),
          duration: frameMs,
        },
        {
          graphic: playerSpriteSheet.getSprite(3, 7),
          duration: frameMs,
        },
      ],
    });
    this.graphics.add("up-walk", upWalk);

    const downWalk = new Animation({
      frames: [
        {
          graphic: playerSpriteSheet.getSprite(0, 4),
          duration: frameMs,
        },
        {
          graphic: playerSpriteSheet.getSprite(1, 4),
          duration: frameMs,
        },
        {
          graphic: playerSpriteSheet.getSprite(2, 4),
          duration: frameMs,
        },
        {
          graphic: playerSpriteSheet.getSprite(3, 4),
          duration: frameMs,
        },
      ],
    });
    this.graphics.add("down-walk", downWalk);
  }

  onPreUpdate(engine: Engine): void {
    this.vel = Vector.Zero;

    this.graphics.use("down-idle");
    if (engine.input.keyboard.isHeld(Keys.ArrowRight)) {
      this.vel = vec(walkSpeed, 0);
      this.graphics.use("right-walk");
    }
    if (engine.input.keyboard.isHeld(Keys.ArrowLeft)) {
      this.vel = vec(-walkSpeed, 0);
      this.graphics.use("left-walk");
    }
    if (engine.input.keyboard.isHeld(Keys.ArrowUp)) {
      this.vel = vec(0, -walkSpeed);
      this.graphics.use("up-walk");
    }
    if (engine.input.keyboard.isHeld(Keys.ArrowDown)) {
      this.vel = vec(0, walkSpeed);
      this.graphics.use("down-walk");
    }

    Debug.drawRay(new Ray(this.pos, this.vel), {
      distance: 100,
      color: Color.Red,
    });
  }
}
