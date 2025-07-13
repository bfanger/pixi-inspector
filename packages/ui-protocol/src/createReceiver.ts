import { applyData, applyEvent, syncTree } from "./tree-fns";
import type { Receiver, TreeControllerNode } from "./types";

export default function createReceiver(tree: TreeControllerNode): Receiver {
  return {
    set(data) {
      applyData(tree, data);
    },
    dispatchEvent(data, event) {
      applyData(tree, data);
      return applyEvent(tree, data, event);
    },
    sync(data, path) {
      applyData(tree, data);
      return syncTree(tree, path);
    },
  };
}
