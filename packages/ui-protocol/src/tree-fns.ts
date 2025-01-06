import type {
  TreeDiff,
  TreeLocation,
  TreePatchOptions,
  TreePath,
  TreeNode,
  TreeDiffMutations,
  TreePatchCreateDto,
  TreePatchCreate,
} from "./types";

/**
 * Lookup a node in the tree by its path
 *
 * @throws {Error} when the node is not found
 */
export function lookup<T>(root: TreeNode<T>, path: TreePath) {
  let node = root;
  for (const index of path) {
    node = node.nested[index];
    if (!node) {
      throw new Error("lookup failed: Node not found");
    }
  }
  return node;
}

/**
 * Based on the child path, lookup the parent and return both the parent and the index of the child.
 */
export function lookupParent<T>(
  root: TreeNode<T>,
  path: TreePath,
): TreeLocation<T> {
  if (path.length === 0) {
    throw new Error("lookupParent failed: Path is empty");
  }
  const index = path[path.length - 1];
  if (path.length === 1) {
    return { parent: root, index };
  }
  return { parent: lookup(root, path.slice(0, -1)), index };
}

/**
 * Apply a diff to the tree, updating the tree in place.
 * Use the events to listen of specific changes
 */
export function patchTree<T>(
  tree: TreeNode<T>,
  diff: TreeDiff,
  {
    createRef,
    onUpdateAttributes,
    onUpdateData,
    onReplace,
    onAppend,
    onTruncate,
  }: TreePatchOptions<T> = {},
) {
  if (diff.updates.length !== 0) {
    for (const update of diff.updates) {
      const node = lookup(tree, update.p);
      if (update.a) {
        node.attributes = update.a;
        onUpdateAttributes?.(node, update.a);
      }
      if ("d" in update) {
        node.data = update.d;
        onUpdateData?.(node, update.d);
      }
    }
  }
  if (diff.replacements.length !== 0) {
    if (!createRef) {
      throw new Error("replacement failed: createRef is required");
    }
    for (const data of diff.replacements) {
      const location = lookupParent(tree, data.p);
      const node: TreeNode<T> = {
        component: data.c,
        attributes: data.a,
        data: data.d,
        path: data.p,
        ref: createRef(data, location),
        nested: [],
      };
      if (data.n) {
        patchNested(node, data.n, createRef);
      }
      location.parent.nested[location.index] = node;
      onReplace?.(node, location);
    }
  }

  if (diff.appends.length !== 0) {
    if (!createRef) {
      throw new Error("append failed: createRef is required");
    }
    for (const data of diff.appends) {
      const location = lookupParent(tree, data.p);
      const node: TreeNode<T> = {
        component: data.c,
        attributes: data.a,
        data: data.d,
        path: data.p,
        ref: createRef(data, location),
        nested: [],
      };
      if (data.n) {
        patchNested(node, data.n, createRef);
      }
      const length = location.parent.nested.push(node);
      if (length !== location.index + 1) {
        throw new Error(`append failed: index mismatch`);
      }
      onAppend?.(node, location);
    }
  }
  if (diff.truncates.length !== 0) {
    for (const truncate of diff.truncates) {
      const parent = lookup(tree, truncate.p);
      if (truncate.l >= parent.nested.length) {
        throw new Error(`truncate failed: No nodes were removed`);
      }
      parent.nested.length = truncate.l;
      onTruncate?.(parent, truncate.l);
    }
  }
}

function patchNested<T>(
  parent: TreeNode<T>,
  nested: TreePatchCreateDto[],
  createRef: NonNullable<TreePatchOptions<T>["createRef"]>,
) {
  for (const data of nested) {
    const location = { parent, index: parent.nested.length };
    const node: TreeNode<T> = {
      component: data.c,
      attributes: data.a,
      data: data.d,
      path: data.p,
      ref: createRef(data, location),
      nested: [],
    };
    if (data.n) {
      patchNested(node, data.n, createRef);
    }
    parent.nested.push(node);
  }
}

/**
 * Helper for creating a diff, walks the current tree and calls the compare function for each node.
 */
export function createDiff<T>(
  node: TreeNode<T>,
  compare: (node: TreeNode<T>, mutations: TreeDiffMutations) => void,
): TreeDiff {
  const diff: TreeDiff = {
    updates: [],
    replacements: [],
    appends: [],
    truncates: [],
  };

  compareNested(node, compare, diff);
  return diff;
}

function compareNested<T>(
  node: TreeNode<T>,
  compare: (node: TreeNode<T>, mutations: TreeDiffMutations) => void,
  diff: TreeDiff,
) {
  let nestedLength = node.nested.length;
  const mutations: TreeDiffMutations = {
    update(patch) {
      diff.updates.push({ p: node.path, a: patch.attributes, d: patch.data });
    },
    replace(patch) {
      diff.replacements.push(createDto(patch, node.path));
      nestedLength = 0; // Skip nested nodes
    },
    append(patch) {
      diff.appends.push(createDto(patch, node.path));
    },
    truncate(length) {
      diff.truncates.push({ p: node.path, l: length });
      nestedLength = length;
    },
  };
  compare(node, mutations);
  for (let i = 0; i < nestedLength; i++) {
    compareNested(node.nested[i], compare, diff);
  }
}

function createDto(patch: TreePatchCreate, path: TreePath) {
  const dto: TreePatchCreateDto = {
    p: path,
    c: patch.component,
    a: patch.attributes,
    d: patch.data,
  };
  if (patch.nested) {
    dto.n = [];
    for (let i = 0; i < patch.nested.length; i++) {
      dto.n.push(createDto(patch.nested[i], [...path, i]));
    }
  }
  return dto;
}
