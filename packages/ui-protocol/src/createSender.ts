import type {
  TreeValue,
  TreeDisplayNode,
  TreeEvent,
  TreePatchDataDto,
  TreePath,
  TreePatchDto,
} from "./types";
import { applyPatch, lookupNode } from "./tree-fns";

export default function createSender(
  tree: TreeDisplayNode,
  updateFn: (
    data: TreePatchDataDto[],
    event?: TreeEvent,
  ) => Promise<TreePatchDto>,
  syncFn: (data: TreePatchDataDto[], path: TreePath) => Promise<TreePatchDto>,
) {
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

    if (processing.events.length > 0) {
      for (const { node, event } of processing.events) {
        if (isNodeValid(tree, node, "dispatchEvent() failed: ")) {
          applyPatch(tree, await updateFn(flushData(), event));
        }
      }
    }
    if (processing.sync.find((node) => node === tree)) {
      applyPatch(tree, await syncFn(flushData(), tree.path));
    } else {
      for (const node of processing.sync) {
        if (isNodeValid(tree, node, "sync() failed: ")) {
          applyPatch(tree, await syncFn(flushData(), node.path));
        }
      }
    }
    if (processing.events.length === 0 && processing.sync.length === 0) {
      applyPatch(tree, await updateFn(flushData()));
    }

    // If there are new events or syncs, process them immediately
  }

  function schedule() {
    promise = (async () => {
      do {
        await Promise.resolve();
        await process();
      } while (
        data.length > 0 ||
        queue.events.length > 0 ||
        queue.sync.length > 0
      );
      promise = undefined;
    })();
  }

  function createDispatcher(node: TreeDisplayNode) {
    return function dispatch(event: string, data?: TreeValue) {
      queue.events.push({
        node,
        event: { path: node.path, type: event, data },
      });
      if (!promise) {
        schedule();
      }
      return promise;
    };
  }

  function setData(node: TreeDisplayNode, value: TreeValue) {
    data.push({ node, value });
    if (!promise) {
      schedule();
    }
    return promise;
  }

  function sync(node: TreeDisplayNode = tree) {
    queue.sync.push(node);
    if (!promise) {
      schedule();
    }
    return promise;
  }
  return { createDispatcher, setData, sync };
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
