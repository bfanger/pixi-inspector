import type {
  TreePatchDto,
  TreeLocation,
  TreePath,
  TreeNode,
  TreeDisplayNode,
  TreeControllerNode,
  TreePatch,
  TreeInit,
  TreePatchInitDto,
  TreePatchDataDto,
  TreeEvent,
} from "./types";

/**
 * Lookup a node in the tree by its path
 *
 * @throws {Error} when the node is not found
 */
export function lookupNode<T extends TreeNode>(root: T, path: TreePath): T {
  let node = root as { children?: T[] };
  for (const index of path) {
    const child = node.children?.[index];
    if (!child) {
      throw new Error("lookup failed: Node not found");
    }
    node = child as T & { children?: T[] };
  }
  return node as T;
}

/**
 * Based on the child path, lookup the parent and return both the parent and the index of the child.
 */
export function lookupParent<T extends TreeNode>(
  root: T,
  path: TreePath,
): TreeLocation<T> {
  if (path.length === 0) {
    throw new Error("lookupParent failed: Path is empty");
  }
  const index = path[path.length - 1];
  if (path.length === 1) {
    return { parent: root, index };
  }
  return { parent: lookupNode<T>(root, path.slice(0, -1)), index };
}

/**
 * Apply the patch to the tree, updating the tree in place.
 */
export function applyPatch(tree: TreeDisplayNode, patch: TreePatchDto) {
  for (const { path, values: props } of patch.props) {
    const node = lookupNode(tree, path);
    node.setProps(props);
  }
  for (const { path, value } of patch.data) {
    const node = lookupNode(tree, path);
    node.setData(value);
  }
  for (const replacement of patch.replacements) {
    const { parent, index } = lookupParent(tree, replacement.path);
    if ("setChild" in parent) {
      const node = parent.setChild(index, replacement);
      parent.children[index] = node;
    } else {
      throw new Error("replace failed: Can't replace children of a leaf node");
    }
  }

  for (const append of patch.appends) {
    const { parent, index } = lookupParent(tree, append.path);
    if ("setChild" in parent) {
      const node = parent.setChild(index, append);
      const length = parent.children.push(node);
      if (length !== index + 1) {
        throw new Error(`append failed: index mismatch`);
      }
    } else {
      throw new Error("append failed: Can't append children into a leaf node");
    }
  }

  for (const truncate of patch.truncates) {
    const parent = lookupNode(tree, truncate.path);
    if ("truncate" in parent) {
      parent.truncate(truncate.length);
      if (truncate.length >= parent.children.length) {
        throw new Error(`truncate failed: No nodes were removed`);
      }
      parent.children.length = truncate.length;
    } else {
      throw new Error(
        "truncate failed: Can't truncate children of a leaf node",
      );
    }
  }
}

/**
 * Synchronize the tree to match the current situation.
 */
export function syncTree(
  tree: TreeControllerNode,
  path: TreePath = [],
): TreePatchDto {
  const patch = createPatch();
  let node = tree;
  if (path.length > 0) {
    node = lookupNode(tree, path);
  }
  syncNode(node, path, patch);
  return patch;
}

/**
 * Update values for specific nodes.
 */
export function applyData(tree: TreeNode, data: TreePatchDataDto[]): void {
  for (const { path, value } of data) {
    const node = lookupNode(tree, path);
    if (!node.setData) {
      throw new Error("data failed: Node didn't implement setData");
    }
    node.setData(value);
  }
}

/**
 * Dispatch an event and return the effects it had on the tree.
 */
export function applyEvent(
  tree: TreeControllerNode,
  data: TreePatchDataDto[],
  event: TreeEvent,
): TreePatchDto {
  applyData(tree, data);
  const patch = createPatch();
  const node = lookupNode(tree, event.path);
  if (!node.dispatchEvent) {
    throw new Error(
      "event failed: ControllerNode didn't implement dispatchEvent",
    );
  }
  const partial: TreePatch = { appends: [], replacements: [] };
  node.dispatchEvent(event, partial);
  applyPartial(patch, node, event.path, partial);
  return patch;
}

/**
 * Synchronize the node and its children adding changes to the patch.
 */
export function syncNode(
  node: TreeControllerNode,
  path: TreePath,
  out: TreePatchDto,
): void {
  const partial: TreePatch = {
    replacements: [],
    appends: [],
  };
  node.sync(partial);
  const { length, skip } = applyPartial(out, node, path, partial);
  for (let i = 0; i < length; i++) {
    if (skip.includes(i)) {
      continue;
    }
    syncNode(node.children![i], [...path, i], out);
  }
}
/**
 * Based on the partial patch information add changes to the target TreePatchDto.
 */
function applyPartial(
  target: TreePatchDto,
  node: TreeControllerNode,
  path: TreePath,
  partial: TreePatch,
): { length: number; skip: number[] } {
  let length = node.children?.length ?? 0;
  const skip: number[] = [];

  if ("data" in partial) {
    target.data.push({ path, value: partial.data });
  }

  if (partial.props) {
    target.props.push({ path, values: partial.props });
  }
  for (const { index, ...replacement } of partial.replacements) {
    if (!node.children) {
      throw new Error("Can't replace children of a leaf node");
    }
    target.replacements.push(
      createInit(replacement, [...path, node.children.length]),
    );
    node.children[index] = replacement.node;
    skip.push(index);
  }

  for (const append of partial.appends) {
    if (!node.children) {
      throw new Error("Can't append children to a leaf node");
    }
    target.appends.push(createInit(append, [...path, node.children.length]));
    node.children.push(append.node);
  }

  if (partial.truncate !== undefined) {
    target.truncates.push({ path, length: partial.truncate });
    if (!node.children) {
      throw new Error("Can't truncate children of a leaf node");
    }
    node.children.length = partial.truncate;
    length = partial.truncate;
  }

  return { length, skip };
}

/**
 * From partial init information create a full patch dto.
 */
function createInit(init: TreeInit, path: TreePath): TreePatchInitDto {
  const dto: TreePatchInitDto = {
    path,
    component: init.component,
    props: init.props,
    data: init.data,
  };
  if (init.children) {
    dto.children = [];
    if (!init.node.children) {
      init.node.children = [];
    }
    for (let i = 0; i < init.children.length; i++) {
      const childInit = init.children[i];
      dto.children.push(createInit(childInit, [...path, i]));
      init.node.children[i] = childInit.node;
    }
  }
  return dto;
}

function createPatch(): TreePatchDto {
  return {
    props: [],
    data: [],
    replacements: [],
    appends: [],
    truncates: [],
  };
}
