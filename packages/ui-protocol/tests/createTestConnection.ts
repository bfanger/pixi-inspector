/* eslint-disable @typescript-eslint/require-await */
import { applyValues, applyEvent, syncTree } from "../src/tree-fns";
import type { Connection, TreeControllerNode } from "../src/types";

export default function createTestConnection(
  tree: TreeControllerNode,
): Connection {
  return {
    set: async (values) => {
      applyValues(tree, values);
    },
    dispatchEvent: async (values, event) => {
      applyValues(tree, values);
      return applyEvent(tree, event);
    },
    sync: async (values, path) => {
      applyValues(tree, values);
      return syncTree(tree, path);
    },
  };
}
