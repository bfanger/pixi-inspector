import { applyUpdate, lookupNode, syncNode } from "./tree-fns";
import type { Receiver, TreeControllerNode } from "./types";

export default function createReceiver(tree: TreeControllerNode): Receiver {
  return {
    update(data, event) {
      return applyUpdate(tree, data, event);
    },
    sync(data, path) {
      const patch = applyUpdate(tree, data);
      const node = lookupNode(tree, path);
      syncNode(node, path, patch);
      return patch;
    },
  };
}
