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
  TreePatchValueDto,
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
      throw new Error(`lookupNode() failed: "/${path.join("/")}" not found`);
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
  applyValues(tree, patch.value);
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
export function applyValues(tree: TreeNode, values: TreePatchValueDto[]): void {
  for (const { path, value } of values) {
    const node = lookupNode(tree, path);
    if (!node.setValue) {
      throw new Error(
        `Applying values failed: Node "/${path.join("/")}" didn't implement setValue()`,
      );
    }
    node.setValue(value);
  }
}

/**
 * Dispatch an event and return the effects it had on the tree.
 */
export function applyEvent(
  tree: TreeControllerNode,
  event: TreeEvent,
): TreePatchDto {
  const node = lookupNode(tree, event.path);
  const handler = node.events?.[event.type];
  let syncParents: number | void = undefined;
  if (handler) {
    const listener = typeof handler === "function" ? handler : handler[0];
    syncParents = listener(...event.args);
  }
  if (syncParents === undefined) {
    syncParents = 0;
  } else if (syncParents === Infinity) {
    syncParents = event.path.length;
  }
  const path = event.path.slice(0, event.path.length - syncParents);
  return syncTree(tree, path);
}

/**
 * Synchronize the node and its children adding changes to the patch.
 */
export function syncNode(
  node: TreeControllerNode,
  path: TreePath,
  patch: TreePatchDto,
): void {
  const partial: TreePatch = {
    replacements: [],
    appends: [],
  };
  node.sync?.(partial);
  const { length, skip } = applyPartial(patch, node, path, partial);
  for (let i = 0; i < length; i++) {
    if (skip.includes(i)) {
      continue;
    }
    syncNode(node.children![i], [...path, i], patch);
  }
}
/**
 * Based on the partial patch information add changes to the target TreePatchDto.
 */
function applyPartial(
  target: TreePatchDto,
  node: TreeControllerNode,
  path: TreePath,
  patch: TreePatch,
): { length: number; skip: number[] } {
  let length = node.children?.length ?? 0;
  const skip: number[] = [];

  if ("value" in patch) {
    target.value.push({ path, value: patch.value });
  }

  if (patch.props) {
    target.props.push({ path, values: patch.props });
  }
  for (const { index, ...replacement } of patch.replacements) {
    if (!node.children) {
      throw new Error("Can't replace children of a leaf node");
    }
    const init = createInit(replacement, [...path, index]);
    target.replacements.push(init.dto);
    node.children[index] = init.node;
    skip.push(index);
  }

  for (const append of patch.appends) {
    if (!node.children) {
      throw new Error("Can't append children to a leaf node");
    }
    const init = createInit(append, [...path, node.children.length]);
    target.appends.push(init.dto);
    node.children.push(init.node);
  }

  if (patch.truncate !== undefined) {
    target.truncates.push({ path, length: patch.truncate });
    if (!node.children) {
      throw new Error("Can't truncate children of a leaf node");
    }
    node.children.length = patch.truncate;
    length = patch.truncate;
  }

  return { length, skip };
}

/**
 * From partial init information create a full patch dto.
 */
function createInit(
  init: TreeInit,
  path: TreePath,
): { dto: TreePatchInitDto; node: TreeControllerNode } {
  const { component, props = {}, value, children, ...rest } = init;
  const node: TreeControllerNode = rest;
  const dto: TreePatchInitDto = {
    path,
    component,
    props,
    events: undefined,
    value,
    setValue: node.setValue ? true : undefined,
  };
  if (node.events) {
    dto.events = Object.entries(node.events).map(([event, fn]) =>
      typeof fn === "function"
        ? { event }
        : { event, debounce: fn[1].debounce, throttle: fn[1].throttle },
    );
  }
  if (children) {
    dto.children = [];
    node.children = [];
    for (let i = 0; i < children.length; i++) {
      const child = createInit(children[i], [...path, i]);
      dto.children.push(child.dto);
      node.children[i] = child.node;
    }
  }
  return { dto, node };
}

function createPatch(): TreePatchDto {
  return {
    props: [],
    value: [],
    replacements: [],
    appends: [],
    truncates: [],
  };
}
