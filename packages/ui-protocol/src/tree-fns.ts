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
} from "./types";

/**
 * Lookup a node in the tree by its path
 *
 * @throws {Error} when the node is not found
 */
export function lookup<T extends TreeNode>(root: T, path: TreePath): T {
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
  return { parent: lookup<T>(root, path.slice(0, -1)), index };
}

/**
 * Apply the patch to the tree, updating the tree in place.
 */
export function applyPatch(tree: TreeDisplayNode, patch: TreePatchDto) {
  for (const { path, props } of patch.props) {
    const node = lookup(tree, path);
    node.setProps(props);
  }
  for (const { path, data } of patch.data) {
    const node = lookup(tree, path);
    node.setData(data);
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
    const parent = lookup(tree, truncate.path);
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
export function syncTree(tree: TreeControllerNode) {
  const patch: TreePatchDto = {
    props: [],
    data: [],
    replacements: [],
    appends: [],
    truncates: [],
  };
  syncNode(tree, [], patch);
  return patch;
}
export function syncNode(
  node: TreeControllerNode,
  path: TreePath,
  out: TreePatchDto,
) {
  let length = node.children?.length ?? 0;
  const skip = [];
  const patch: TreePatch = {
    replacements: [],
    appends: [],
  };
  node.sync(patch);

  if ("data" in patch) {
    out.data.push({ path, data: patch.data });
  }

  if (patch.props) {
    out.props.push({ path, props: patch.props });
  }
  for (const { index, ...replacement } of patch.replacements) {
    if (!node.children) {
      throw new Error("Can't replace children of a leaf node");
    }
    out.replacements.push(create(replacement, [...path, node.children.length]));
    node.children[index] = replacement.node;
    skip.push(index);
  }

  for (const append of patch.appends) {
    if (!node.children) {
      throw new Error("Can't append children to a leaf node");
    }
    out.appends.push(create(append, [...path, node.children.length]));
    node.children.push(append.node);
  }

  if (patch.truncate !== undefined) {
    out.truncates.push({ path, length: patch.truncate });
    if (!node.children) {
      throw new Error("Can't truncate children of a leaf node");
    }
    node.children.length = patch.truncate;
    length = patch.truncate;
  }
  for (let i = 0; i < length; i++) {
    if (skip.includes(i)) {
      continue;
    }
    syncNode(node.children![i], [...path, i], out);
  }

  return out;
}

function create(init: TreeInit, path: TreePath) {
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
      dto.children.push(create(childInit, [...path, i]));
      init.node.children[i] = childInit.node;
    }
  }
  return dto;
}
