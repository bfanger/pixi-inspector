import type { GameObjects, Scene, Scenes } from "phaser";
import type { DisplayObject } from "pixi.js";
import type pixiDevtools from "./pixi-devtools/pixiDevtools";
import type pixiDevtoolsViewport from "./pixi-devtools/pixiDevtoolsViewport";
import type pixiDevtoolsOverlay from "./pixi-devtools/pixiDevtoolsOverlay";
import type pixiDevtoolsOutline from "./pixi-devtools/pixiDevtoolsOutline";
import type pixiDevtoolsProperties from "./pixi-devtools/pixiDevtoolsProperties";

export type BridgeFn = <T>(code: string) => Promise<T>;

export type PixiDevtools = ReturnType<typeof pixiDevtools> & {
  viewport: ReturnType<typeof pixiDevtoolsViewport>;
  overlay: ReturnType<typeof pixiDevtoolsOverlay>;
  outline: ReturnType<typeof pixiDevtoolsOutline>;
  properties: ReturnType<typeof pixiDevtoolsProperties>;
};

export type OutlinerNode = {
  id: string;
  name: string;
  leaf: boolean;
  active: boolean;
  visible?: boolean;
  children?: OutlinerNode[];
};
/** A node in an PixiJS stage or Phaser scene */
export type UniversalNode =
  | DisplayObject
  | Scene
  | GameObjects.GameObject
  | Scenes.SceneManager
  | GameObjects.Particles.ParticleEmitter;

export type NodeProperties = {
  x?: number;
  y?: number;
  angle?: number;
  scaleX?: number;
  scaleY?: number;
  anchorX?: number;
  anchorY?: number;
  skewX?: number;
  skewY?: number;
  width?: number;
  height?: number;
  alpha?: number;
};
