/* eslint-disable @typescript-eslint/require-await */
import { applyValues, applyEvent, syncTree } from "../src/tree-fns";
import type { Connection, TreeControllerNode } from "../src/types";

export default function createTestConnection(
  tree: TreeControllerNode,
): Connection {
  return {
    set: async (values) => {
      return applyValues(tree, values);
    },
    dispatchEvent: async (values, event) => {
      return applyEvent(tree, event, applyValues(tree, values));
    },
    sync: async (values, path) => {
      return syncTree(tree, path, applyValues(tree, values));
    },
  };
}
