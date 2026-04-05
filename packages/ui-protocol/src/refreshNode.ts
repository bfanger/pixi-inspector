import type { TreeInit, TreePatch, TreeValue } from "./types";

type RefreshOptions = {
  interval: number;
  depth?: number;
  children?: TreeInit[];
  /** Augment the sync to alter the children and/or the interval/depth properties */
  sync?: (patch: TreePatch) => void;
  /** Alternate refresh event handler */
  refresh?: (depth: TreeValue) => number;
};
/**
 * Node that handles the data & events of the Refresh component.
 */
export default function refreshNode({
  children,
  sync,
  refresh,
  ...props
}: RefreshOptions): TreeInit {
  let tick = false;
  return {
    component: "Refresh",
    props,
    sync(patch: TreePatch) {
      tick = !tick;
      patch.value = tick;
      return sync?.(patch);
    },
    setValue(update: TreeValue) {
      tick = update as boolean;
    },
    events: {
      refresh: refresh ?? refreshHandler,
    },
    children,
  };
}

function refreshHandler(depth: TreeValue) {
  return depth as number;
}
