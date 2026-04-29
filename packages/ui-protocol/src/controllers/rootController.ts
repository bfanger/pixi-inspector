import type { UIProtocolInit, UIProtocolPatch } from "../svelte/defineUI";
import type { TreeControllerNode, TreeInit } from "../types";

export default function rootController(
  init: () => UIProtocolInit[],
  options?: {
    sync?: (
      this: TreeControllerNode,
      patch: UIProtocolPatch<{ [prop: string]: never }>,
    ) => void;
    reset?: (this: TreeControllerNode) => void;
  },
): TreeControllerNode {
  return {
    slots: { children: [] },
    sync(patch) {
      if (this.slots!.children.length === 0) {
        patch.appends = init() as TreeInit[];
      }
      options?.sync?.call(
        this,
        patch as UIProtocolPatch<{ [prop: string]: never }>,
      );
    },
    events: {
      reset() {
        this.slots!.children = [];
        options?.reset?.call(this);
      },
    },
  };
}
