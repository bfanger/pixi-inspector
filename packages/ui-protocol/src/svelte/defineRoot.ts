import type { Snippet } from "svelte";
import type { TreeControllerNode } from "../types";
import type { UIProtocolInit, UIProtocolInitPatch } from "./defineUI";

type UIProtocolRoot = {
  children: UIProtocolInit[];
  events: {
    reset: () => void;
  };
  sync: (
    patch: UIProtocolInitPatch<{ children: Snippet; reset: () => void }>,
  ) => void; //UIProtocolInitPatch<UIProtocolInit>
};
export function defineRoot<T extends UIProtocolRoot>(root: T) {
  return root as Omit<TreeControllerNode, "children"> & {
    children: TreeControllerNode[];
  };
}
