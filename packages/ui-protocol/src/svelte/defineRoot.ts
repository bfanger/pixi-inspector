import type { TreeControllerNode } from "../types";
import type { UIProtocolInit, UIProtocolPatch } from "./defineUI";

type UIProtocolRoot = {
  children: UIProtocolInit[];
  events: {
    reset: () => void;
  };
  sync: (
    patch: UIProtocolPatch<{ children: unknown; reset: () => void }>,
  ) => void;
};
export function defineRoot<T extends UIProtocolRoot>(root: T) {
  return root as Omit<TreeControllerNode, "children"> & {
    children: TreeControllerNode[];
  };
}
