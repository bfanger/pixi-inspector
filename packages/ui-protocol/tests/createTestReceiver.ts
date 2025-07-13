import {
  createReceiver,
  type AsyncReceiver,
  type TreeControllerNode,
} from "../src";

export default function createTestReceiver(
  tree: TreeControllerNode,
): AsyncReceiver {
  const receiver = createReceiver(tree);
  return {
    set: (data) => Promise.resolve(receiver.set(data)),
    dispatchEvent: (data, event) =>
      Promise.resolve(receiver.dispatchEvent(data, event)),
    sync: (data, path) => Promise.resolve(receiver.sync(data, path)),
  };
}
