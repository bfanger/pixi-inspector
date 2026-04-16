import type { TreeControllerNode } from "../types";
import type { UIProtocolInit, UIProtocolPatch } from "./defineUI";

type UIProtocolRoot = {
  slots: { children: UIProtocolInit[] };
  events: {
    reset: () => void;
  };
  sync: (
    patch: UIProtocolPatch<{ children: unknown; reset: () => void }>,
  ) => void;
};
export function defineRoot<T extends UIProtocolRoot>(root: T) {
  return root as Omit<TreeControllerNode, "slots"> & {
    slots: { children: TreeControllerNode[] };
  };
}
