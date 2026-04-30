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
  let node = root as { slots?: Record<string, T[]> };
  for (const { slot, index } of path) {
    const child = node.slots?.[slot][index];
    if (!child) {
      throw new Error(`lookupNode() failed: "${formatPath(path)}" not found`);
    }
    node = child as T & { slots?: Record<string, T[]> };
  }
  return node as T;
}

function formatPath(path: TreePath) {
  return `/${path.map((part) => `${part.slot}[${part.index}]`).join("/")}`;
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
  const { slot, index } = path[path.length - 1];
  if (path.length === 1) {
    return { parent: root, slot, index };
  }
  return { parent: lookupNode<T>(root, path.slice(0, -1)), slot, index };
}

/**
 * Apply the patch to the tree, updating the tree in place.
 */
export function applyPatch(tree: TreeDisplayNode, patch: TreePatchDto) {
  for (const { path, values: props } of patch.props) {
    const node = lookupNode(tree, path);
    node.setProps(props);
  }
  applyDisplayValues(tree, patch.value);
  for (const replacement of patch.replacements) {
    const { parent, index, slot } = lookupParent(tree, replacement.path);
    if (!("createNode" in parent)) {
      throw new Error(`replace failed: Can't replace subnodes of a leaf node`);
    } else if (!parent.slots[slot]) {
      throw new Error(
        `replace failed: Slot "${slot}" doesn't exist in ${formatPath(replacement.path)}`,
      );
    }
    const node = parent.createNode(slot, index, replacement);
    parent.slots[slot][index] = node;
  }

  for (const append of patch.appends) {
    const { parent, index, slot } = lookupParent(tree, append.path);
    if (!("createNode" in parent)) {
      throw new Error("append failed: Can't append to a leaf node");
    }
    if (!parent.slots[slot]) {
      parent.slots[slot] = [];
    }
    const node = parent.createNode(slot, index, append);
    const length = parent.slots[slot].push(node);
    if (length !== index + 1) {
      throw new Error(`append failed: index mismatch`);
    }
  }

  for (const truncate of patch.truncates) {
    const container = lookupNode(tree, truncate.path);
    if (!("truncate" in container)) {
      throw new Error("truncate failed: Can't truncate a leaf node");
    }
    container.truncate(truncate.slot, truncate.length);
    if (Array.isArray(container.slots[truncate.slot]) === false) {
      throw new Error(
        `truncate failed: slot '${truncate.slot}' not defined at ${formatPath(truncate.path)}`,
      );
    }
    if (truncate.length === null) {
      delete container.slots[truncate.slot];
    } else {
      if (truncate.length >= container.slots[truncate.slot].length) {
        throw new Error(`truncate failed: No nodes were removed`);
      }
      container.slots[truncate.slot].length = truncate.length;
    }
  }

  for (const error of patch.errors) {
    let parentPath = error.path;
    while (true) {
      parentPath = parentPath.slice(0, -1);
      if (parentPath.length === 0) {
        throw new Error("Error occurred outside ErrorBoundary", {
          cause: error.message,
        });
      }
      const parent = lookupNode(tree, parentPath);
      if ("setError" in parent && parent.setError) {
        parent.setError(error.message);
        break;
      }
    }
  }
}

/**
 * Synchronize the tree to match the current situation.
 */
export function syncTree(
  tree: TreeControllerNode,
  path: TreePath,
  patch: TreePatchDto,
): TreePatchDto {
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
export function applyValues(
  tree: TreeControllerNode,
  values: TreePatchValueDto[],
): TreePatchDto {
  const patch = createPatch();
  for (const { path, value } of values) {
    const node = lookupNode(tree, path);
    try {
      if (!node.setValue) {
        throw new Error(
          `Applying values failed: Node "${formatPath(path)}" didn't implement setValue()`,
        );
      }
      node.setValue(value);
    } catch (err) {
      console.warn(err);
      patch.errors.push({
        path,
        message: err instanceof Error ? err.message : undefined,
      });
    }
  }
  return patch;
}

export function applyDisplayValues(
  tree: TreeDisplayNode,
  values: TreePatchValueDto[],
) {
  for (const { path, value } of values) {
    const node = lookupNode(tree, path);
    if (!node.setValue) {
      throw new Error(
        `Applying values failed: Node "${formatPath(path)}" didn't implement setValue()`,
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
  patch: TreePatchDto,
): TreePatchDto {
  const node = lookupNode(tree, event.path);
  try {
    const handler = node.events?.[event.type];
    let syncParents: number | void = undefined;
    if (handler) {
      const listener = typeof handler === "function" ? handler : handler[0];
      syncParents = listener.apply(node, event.args);
    }
    if (syncParents === undefined) {
      syncParents = 0;
    } else if (syncParents === Infinity) {
      syncParents = event.path.length;
    }
    const path = event.path.slice(0, event.path.length - syncParents);
    return syncTree(tree, path, patch);
  } catch (err) {
    console.warn(err);
    patch.errors.push({
      path: event.path,
      message: `${event.type} failed: ${err instanceof Error ? err.message : ""}`,
    });
    return patch;
  }
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
    truncate: {},
  };
  try {
    node.sync?.(partial);
  } catch (err) {
    console.warn(err);
    patch.errors.push({
      path,
      message: `sync failed: ${err instanceof Error ? err.message : ""}`,
    });
  }
  const nested = applyPartial(patch, node, path, partial);
  for (const [slot, { skip, length }] of Object.entries(nested)) {
    for (let i = 0; i < length; i++) {
      if (skip?.includes(i)) {
        continue;
      }
      syncNode(node.slots![slot][i], [...path, { slot, index: i }], patch);
    }
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
): Record<string, { length: number; skip: number[] }> {
  if ("value" in patch) {
    target.value.push({ path, value: patch.value });
  }
  if (patch.props) {
    target.props.push({ path, values: patch.props });
  }
  const slots: Record<string, { length: number; skip: number[] }> = {};
  if (node.slots) {
    for (const slot of Object.keys(node.slots)) {
      slots[slot] = { skip: [], length: node.slots[slot].length };
    }
  }
  for (const {
    index,
    slot = "children",
    ...replacement
  } of patch.replacements) {
    if (!node.slots?.[slot]) {
      throw new Error(`Can't replace node. Slot "${slot}" not defined in node`);
    }
    const init = createInit(replacement, [...path, { slot, index }]);
    target.replacements.push(init.dto);
    node.slots[slot][index] = init.node;
    slots[slot].skip.push(index);
  }

  for (const { slot = "children", ...append } of patch.appends) {
    if (!node.slots) {
      throw new Error("Can't append to a leaf node");
    }
    if (!node.slots[slot]) {
      node.slots[slot] = [];
    }

    const init = createInit(append, [
      ...path,
      { slot, index: node.slots[slot].length },
    ]);
    target.appends.push(init.dto);
    node.slots[slot].push(init.node);
  }

  for (const [slot, length] of Object.entries(patch.truncate)) {
    target.truncates.push({ path, slot, length });
    if (!node.slots?.[slot]) {
      if (!node.slots) {
        throw new Error("Can't truncate a leaf node");
      }
      throw new Error(`Can't truncate, slot "${slot}", not defined in node`);
    }
    if (length === null) {
      delete node.slots[slot];
      slots[slot].length = 0;
    } else {
      node.slots[slot].length = length;
      slots[slot].length = length;
    }
  }

  return slots;
}

/**
 * From partial init information create a full patch dto.
 */
function createInit(
  init: TreeInit,
  path: TreePath,
): { dto: TreePatchInitDto; node: TreeControllerNode } {
  if (init.children) {
    if (init.slots) {
      throw new Error("Move the children into the slots");
    }
    init.slots = { children: init.children };
    delete init.children;
  }
  const {
    component,
    props = {},
    value,
    slots,
    children,
    getValue,
    ...rest
  } = init;
  const node: TreeControllerNode = { ...rest };
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
  if (getValue) {
    if (node.sync) {
      const initSync = node.sync.bind(node);
      node.sync = function (patch) {
        patch.value = getValue();
        initSync(patch);
      };
    } else {
      node.sync = function (patch) {
        patch.value = getValue();
      };
    }
    if (!("value" in init)) {
      dto.value = getValue();
    }
  }
  if (slots) {
    dto.slots = {};
    node.slots = {};
    for (const [slot, inits] of Object.entries(slots)) {
      dto.slots[slot] = [];
      node.slots[slot] = [];
      for (let i = 0; i < inits.length; i++) {
        const child = createInit(inits[i], [...path, { slot, index: i }]);
        dto.slots[slot].push(child.dto);
        node.slots[slot][i] = child.node;
      }
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
    errors: [],
  };
}
