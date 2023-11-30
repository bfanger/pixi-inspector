import type { GameObjects, Scene, Scenes } from "phaser";
import type {
  Cursor,
  DisplayObject,
  EventMode,
  TextStyleAlign,
  TextStyleFontStyle,
  TextStyleFontVariant,
  TextStyleFontWeight,
  TextStyleLineJoin,
  TextStyleTextBaseline,
  TextStyleWhiteSpace,
} from "pixi.js";
import type pixiDevtools from "./pixi-devtools/pixiDevtools";
import type pixiDevtoolsViewport from "./pixi-devtools/pixiDevtoolsViewport";
import type pixiDevtoolsOverlay from "./pixi-devtools/pixiDevtoolsOverlay";
import type pixiDevtoolsOutline from "./pixi-devtools/pixiDevtoolsOutline";
import type pixiDevtoolsProperties from "./pixi-devtools/pixiDevtoolsProperties";
import type pixiDevtoolsSelection from "./pixi-devtools/pixiDevtoolsSelection";

export type BridgeFn = <T>(code: string) => Promise<T>;

export type PixiDevtools = ReturnType<typeof pixiDevtools> & {
  selection: ReturnType<typeof pixiDevtoolsSelection>;
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
  selectable: boolean;
  match?: boolean;
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

export type PropertyTab = "scene" | "object" | "text";
export type PropertyTabState = {
  tabs: PropertyTab[];
  active: PropertyTab;
  properties?: NodeProperties;
};

export type PointLike3D = {
  x: number;
  y: number;
  z: number;
};

export type QuaternionLike = {
  x: number;
  y: number;
  z: number;
  w: number;
};

export type NodeProperties = PixiProperties & Pixi3DProperties;

export type PixiProperties = {
  // Object
  x?: number;
  y?: number;
  angle?: number;
  scaleX?: number;
  scaleY?: number;
  anchorX?: number;
  anchorY?: number;
  pivotX?: number;
  pivotY?: number;
  originX?: number;
  originY?: number;
  skewX?: number;
  skewY?: number;
  width?: number;
  height?: number;
  alpha?: number;
  visible?: boolean;
  cullable?: boolean;
  sortableChildren?: boolean;
  zIndex?: number;
  interactive?: boolean;
  cursor?: Cursor;
  buttonMode?: boolean;
  interactiveChildren?: boolean;
  eventMode?: EventMode;
  // Scene
  speed?: number;
  started?: boolean;
  // Text
  text?: string;
  align?: TextStyleAlign;
  breakWords?: boolean;
  dropShadow?: boolean;
  dropShadowAlpha?: number;
  dropShadowAngle?: number;
  dropShadowBlur?: number;
  dropShadowColor?: string;
  dropShadowDistance?: number;
  fontFamily?: string;
  fontSize?: number;
  fontStyle?: TextStyleFontStyle;
  fontVariant?: TextStyleFontVariant;
  fontWeight?: TextStyleFontWeight;
  leading?: number;
  letterSpacing?: number;
  lineHeight?: number;
  lineJoin?: TextStyleLineJoin;
  miterLimit?: number;
  padding?: number;
  stroke?: string;
  strokeThickness?: number;
  textBaseline?: TextStyleTextBaseline;
  trim?: boolean;
  whiteSpace?: TextStyleWhiteSpace;
  wordWrap?: boolean;
  wordWrapWidth?: number;
};

export type Pixi3DProperties = {
  z?: number;
  scaleZ?: number;
  quatX?: number;
  quatY?: number;
  quatZ?: number;
  quatW?: number;
};
