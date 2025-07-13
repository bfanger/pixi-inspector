import {
  createReceiver,
  type Connection,
  type TreeControllerNode,
} from "../src";

export default function createTestConnection(
  tree: TreeControllerNode,
): Connection {
  const receiver = createReceiver(tree);
  return {
    set: (data) => Promise.resolve(receiver.set(data)),
    dispatchEvent: (data, event) =>
      Promise.resolve(receiver.dispatchEvent(data, event)),
    sync: (data, path) => Promise.resolve(receiver.sync(data, path)),
  };
}
