import type { UIProtocolInit } from "./svelte/defineUI";

type RefreshInit = Extract<UIProtocolInit, { component: "Refresh" }>;

type RefreshOptions = RefreshInit["props"] & {
  children?: RefreshInit["children"];
  /** Augment the sync to alter the children and/or the interval/depth properties */
  sync?: RefreshInit["sync"];
  /** Alternate refresh event handler */
  refresh?: NonNullable<RefreshInit["events"]>["refresh"];
};

/**
 * Node that handles the data & events of the Refresh component.
 */
export default function refreshNode({
  children,
  sync,
  refresh,
  ...props
}: RefreshOptions): RefreshInit {
  let tick = false;
  return {
    component: "Refresh",
    props,
    value: tick,
    sync(patch) {
      tick = !tick;
      patch.value = tick;
      return sync?.call(this, patch);
    },
    events: {
      refresh: refresh ?? refreshHandler,
    },
    children,
  };
}

function refreshHandler(depth: number) {
  return depth;
}
