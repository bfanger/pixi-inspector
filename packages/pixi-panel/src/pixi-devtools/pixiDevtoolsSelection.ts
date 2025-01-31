import type { PixiDevtools, UniversalNode } from "../types";

export default function pixiDevtoolsSelection(devtools: PixiDevtools) {
  const win = window as any;
  const metaProperty = Symbol("pixi-devtools-selectable");
  let highlight: UniversalNode | undefined;

  return {
    active() {
      return win.$pixi as UniversalNode | undefined;
    },
    activate(node?: UniversalNode) {
      win.$pixi = node;
      devtools.dispatchEvent("activate", node);
    },
    selectable(node: UniversalNode) {
      return (node as any)[metaProperty] !== false;
    },
    disable(node: UniversalNode) {
      (node as any)[metaProperty] = false;
    },
    enable(node: UniversalNode) {
      (node as any)[metaProperty] = true;
    },
    highlighted(): UniversalNode | undefined {
      return highlight;
    },
    highlight(node: UniversalNode | undefined) {
      highlight = node;
    },
  };
}
