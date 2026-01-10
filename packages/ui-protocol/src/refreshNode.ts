import type { TreeControllerNode, TreePatch, TreeValue } from "./types";

/**
 * Node that handles the data & events of the Refresh component.
 *
 * Usage in a TreeInit:
 * {
 *   component: "Refresh",
 *   props: { interval: 1_000 },
 *   node: refreshNode(),
 *   children: [
 *     ...
 */
export default function refreshNode(options?: {
  /** Augment the sync to alter the children and/or the interval/depth properties */
  sync?: (patch: TreePatch, controller: TreeControllerNode) => void;
  /** Alternate refresh event handler */
  refresh?: (depth: TreeValue) => number;
}) {
  let tick = false;
  const node: TreeControllerNode = {
    sync(patch) {
      tick = !tick;
      patch.value = tick;
      return options?.sync?.(patch, node);
    },
    setValue(update) {
      tick = update as boolean;
    },
    events: {
      refresh: options?.refresh ?? refreshHandler,
    },
  };
  return node;
}

function refreshHandler(depth: TreeValue) {
  return depth as number;
}
