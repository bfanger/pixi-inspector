import type {
  TreeValue,
  TreeDisplayNode,
  TreeEvent,
  TreePatchDataDto,
  Connection,
  Sender,
} from "./types";
import { applyPatch, lookupNode } from "./tree-fns";

export default function createSender(
  tree: TreeDisplayNode,
  connection: Connection,
): Sender {
  const data: { node: TreeDisplayNode; value: TreeValue }[] = [];
  const queue: {
    events: { node: TreeDisplayNode; event: TreeEvent }[];
    sync: TreeDisplayNode[];
  } = { events: [], sync: [] };
  let promise: Promise<void> | undefined;

  function flushData() {
    const dto: TreePatchDataDto[] = [];
    for (const { node, value } of data) {
      if (isNodeValid(tree, node, "setData() failed: ")) {
        dto.push({ path: node.path, value });
      }
    }
    data.length = 0;
    return dto;
  }

  async function process() {
    const processing = { events: queue.events, sync: queue.sync };
    queue.events = [];
    queue.sync = [];

    if (
      processing.events.length === 0 &&
      processing.sync.length === 0 &&
      data.length > 0
    ) {
      // Data only
      return await connection.set(flushData());
    }
    if (processing.events.length !== 0) {
      // Events
      for (const { node, event } of processing.events) {
        if (isNodeValid(tree, node, "dispatchEvent() failed: ")) {
          applyPatch(tree, await connection.dispatchEvent(flushData(), event));
        }
      }
    }
    if (processing.sync.length !== 0) {
      // Sync
      if (processing.sync.find((node) => node === tree)) {
        applyPatch(tree, await connection.sync(flushData(), tree.path));
      } else {
        for (const node of processing.sync) {
          if (isNodeValid(tree, node, "sync() failed: ")) {
            applyPatch(tree, await connection.sync(flushData(), node.path));
          }
        }
      }
    }
  }

  let resetting = false;
  function schedule() {
    if (resetting) {
      throw new Error("schedule() was called during a reset");
    }
    promise = (async () => {
      do {
        await Promise.resolve();
        await process();
      } while (
        // If there are new events or syncs, process them immediately
        data.length > 0 ||
        queue.events.length > 0 ||
        queue.sync.length > 0
      );
      promise = undefined;
    })();
  }
  return {
    setData(node: TreeDisplayNode, value: TreeValue) {
      data.push({ node, value });
      if (!promise) {
        schedule();
      }
      return promise!;
    },

    dispatchEvent(node: TreeDisplayNode, event: string, data?: TreeValue) {
      queue.events.push({
        node,
        event: { path: node.path, type: event, data },
      });
      if (!promise) {
        schedule();
      }
      return promise!;
    },

    sync(node: TreeDisplayNode = tree) {
      queue.sync.push(node);
      if (!promise) {
        schedule();
      }
      return promise!;
    },

    async reset() {
      resetting = true;
      promise = undefined;
      try {
        if ("children" in tree) {
          tree.children = [];
        }
        const init = await connection.dispatchEvent([], {
          path: [],
          type: "reset",
        });
        queue.events = [];
        queue.sync = [];
        data.length = 0;
        applyPatch(tree, init);
      } finally {
        resetting = false;
      }
    },
  };
}

function isNodeValid(
  tree: TreeDisplayNode,
  node: TreeDisplayNode,
  prefix = "",
): boolean {
  try {
    if (node === lookupNode(tree, node.path)) {
      return true;
    } else {
      console.warn(`${prefix}node was replaced`);
      return false;
    }
  } catch {
    console.warn(`${prefix}node was no longer available`);
    return false;
  }
}
