import type { TreeControllerNode, TreePatch } from "./types";

/**
 * Node that handles the data & events of the Refresh component.
 *
 * @param sync Augment the sync to alter the children and/or the interval/depth properties
 *
 * Usage in a TreeInit:
 * {
 *   component: "Refresh",
 *   props: { interval: 1_000 },
 *   node: refreshNode(),
 *   children: [
 *     ...
 */
export default function refreshNode(
  sync?: (patch: TreePatch, controller: TreeControllerNode) => void,
) {
  let tick = false;
  const node: TreeControllerNode = {
    sync(patch) {
      tick = !tick;
      patch.value = tick;
      return sync?.(patch, node);
    },
    setValue(update) {
      tick = update as boolean;
    },
    events: {
      refresh: (depth) => {
        return depth as number;
      },
    },
  };
  return node;
}
