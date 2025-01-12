import { applyUpdate, lookupNode, syncNode } from "./tree-fns";
import {
  TreeControllerNode,
  TreeEvent,
  TreePatchDataDto,
  TreePatchDto,
  TreePath,
} from "./types";

export default function createReceiver(tree: TreeControllerNode) {
  function update(data: TreePatchDataDto[], event?: TreeEvent): TreePatchDto {
    return applyUpdate(tree, data, event);
  }

  function sync(data: TreePatchDataDto[], path: TreePath): TreePatchDto {
    const patch = applyUpdate(tree, data);
    const node = lookupNode(tree, path);
    syncNode(node, path, patch);
    return patch;
  }

  return { update, sync };
}
