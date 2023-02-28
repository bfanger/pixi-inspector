import type pixiDevtools from "./pixi-devtools/pixiDevtools";
import type pixiDevtoolsOverlay from "./pixi-devtools/pixiDevtoolsOverlay";
import type pixiDevtoolsOutline from "./pixi-devtools/pixiDevtoolsOutline";

export type BridgeFn = <T>(code: string) => Promise<T>;

export type PixiDevtools = ReturnType<typeof pixiDevtools> & {
  outline: ReturnType<typeof pixiDevtoolsOutline>;
  highlight: ReturnType<typeof pixiDevtoolsOverlay>;
};

export type OutlinerNode = {
  id: string;
  name: string;
  leaf: boolean;
  active: boolean;
  visible: boolean;
  children?: OutlinerNode[];
};
