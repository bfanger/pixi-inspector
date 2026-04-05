import type { ComponentProps } from "svelte";
import {
  type InitOf,
  type UIProtocolInit,
  type UIProtocolInitPatch,
} from "./svelte/defineUI";
import type Refresh from "./svelte/Refresh.svelte";

type RefreshOptions = {
  interval: number;
  depth?: number;
  children?: UIProtocolInit[];
  /** Augment the sync to alter the children and/or the interval/depth properties */
  sync?: (patch: UIProtocolInitPatch<ComponentProps<typeof Refresh>>) => void;
  /** Alternate refresh event handler */
  refresh?: (depth: number) => number;
};
/**
 * Node that handles the data & events of the Refresh component.
 */
export default function refreshNode({
  children,
  sync,
  refresh,
  ...props
}: RefreshOptions): InitOf<"Refresh", ComponentProps<typeof Refresh>> {
  let tick = false;
  return {
    component: "Refresh",
    props,
    value: tick,
    sync(patch) {
      tick = !tick;
      patch.value = tick;
      return sync?.(patch);
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
