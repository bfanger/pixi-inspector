import type {
  TreeDiff,
  TreeLocation,
  TreeNode,
  TreePatcher,
  TreePath,
  TreeParentNode,
  TreePatchAdd,
} from "./types";

export function lookup<T>(root: TreeParentNode<T>, path: TreePath) {
  let node = root as TreeNode<T>;
  for (const index of path) {
    node = node.nested[index];
    if (!node) {
      throw new Error("lookup failed: Node not found");
    }
  }
  return node;
}

export function lookupParent<T>(
  root: TreeParentNode<T>,
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

export function patchTree<T>(
  tree: TreeParentNode<T>,
  diff: TreeDiff,
  {
    createRef,
    onUpdateAttributes,
    onUpdateData,
    onReplace,
    onAppend,
    onTruncate,
  }: TreePatcher<T>,
) {
  if (diff.updates) {
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
  if (diff.replacements) {
    for (const data of diff.replacements) {
      const location = lookupParent(tree, data.p);
      const node: TreeNode<T> = {
        ref: createRef(data, location),
        component: data.c,
        attributes: data.a,
        data: data.d,
        nested: [],
      };
      if (data.n) {
        patchNested(node, data.n, createRef);
      }
      location.parent.nested[location.index] = node;
      onReplace?.(node, location);
    }
  }
  if (diff.appends) {
    for (const data of diff.appends) {
      const location = lookupParent(tree, data.p);
      const node: TreeNode<T> = {
        component: data.c,
        attributes: data.a,
        data: data.d,
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
  if (diff.truncates) {
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
  nested: TreePatchAdd[],
  createRef: TreePatcher<T>["createRef"],
) {
  for (const data of nested) {
    const location = { parent, index: parent.nested.length };
    const node: TreeNode<T> = {
      ref: createRef(data, location),
      component: data.c,
      attributes: data.a,
      data: data.d,
      nested: [],
    };
    if (data.n) {
      patchNested(node, data.n, createRef);
    }
    parent.nested.push(node);
  }
}
