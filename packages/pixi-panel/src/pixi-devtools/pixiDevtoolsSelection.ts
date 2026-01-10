import type { UniversalNode } from "../types";

export default function pixiDevtoolsSelection() {
  const win = window as any;
  const metaPropertyMap = new WeakMap<UniversalNode, boolean>();
  let highlight: UniversalNode | undefined;

  return {
    active() {
      return win.$pixi as UniversalNode | undefined;
    },
    activate(node?: UniversalNode) {
      win.$pixi = node;
    },
    selectable(node: UniversalNode) {
      return metaPropertyMap.get(node) !== false;
    },
    disable(node: UniversalNode) {
      metaPropertyMap.set(node, false);
    },
    enable(node: UniversalNode) {
      metaPropertyMap.set(node, true);
    },
    highlighted(): UniversalNode | undefined {
      return highlight;
    },
    highlight(node: UniversalNode | undefined) {
      highlight = node;
    },
  };
}
