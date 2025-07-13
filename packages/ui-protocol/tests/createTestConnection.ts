/* eslint-disable @typescript-eslint/require-await */
import { applyData, applyEvent, syncTree } from "../src/tree-fns";
import type { Connection, TreeControllerNode } from "../src/types";

export default function createTestConnection(
  tree: TreeControllerNode,
): Connection {
  return {
    set: async (data) => {
      applyData(tree, data);
    },
    dispatchEvent: async (data, event) => {
      applyData(tree, data);
      return applyEvent(tree, event);
    },
    sync: async (data, path) => {
      applyData(tree, data);
      return syncTree(tree, path);
    },
  };
}
