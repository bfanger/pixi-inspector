export type TreeNode = TreeControllerNode | TreeDisplayNode;

/**
 * TreeNode inside the inspected page, connected to an game entity or a property of an entity
 */
export type TreeControllerNode = {
  children?: TreeControllerNode[];
  sync(out: TreePatch): void;
  setData?(value: TreeValue): void;
  dispatchEvent?(event: TreeEvent, out: TreePatch): void;
};
/**
 * TreeNode inside DevTools, connected to a (Svelte) Component
 */
export type TreeDisplayNode = TreeDisplayContainerNode | TreeDisplayLeafNode;
export type TreeDisplayLeafNode = {
  readonly path: TreePath;
  setProps(props: TreeObjectValue): void;
  setData(value: TreeValue): void;
};
export type TreeDisplayContainerNode = {
  readonly path: TreePath;
  setProps(props: TreeObjectValue): void;
  setData(value: TreeValue): void;
  children: TreeDisplayNode[];
  setChild(index: number, init: TreePatchInitDto): TreeDisplayNode;
  truncate(length: number): void;
};

export type TreeEvent = { path: TreePath; type: string; data?: TreeValue };

// JSON-compatible type & undefined
export type TreeValue =
  | undefined
  | null
  | boolean
  | number
  | string
  | TreeArrayValue
  | TreeObjectValue;
export type TreeObjectValue = {
  [key: string]: TreeValue;
};
type TreeArrayValue = TreeValue[];

/**
 * A path into the tree structure bases on depth & index.
 *
 * Example:
 *  root
 *  |- container1
 *  |  |- child1
 *  |  |- child2
 *  |- container2
 *
 * []    = root
 * [0,2] = child2
 * [1]   = container2
 */
export type TreePath = number[];

export type TreeInit = {
  node: TreeControllerNode;
  component: string;
  props: TreeObjectValue;
  data: TreeValue;
  children?: TreeInit[];
};
/**
 * Patch data for a new tree node
 */
export type TreePatchInitDto = {
  path: TreePath;
  component: string;
  props: TreeObjectValue;
  data: TreeValue;
  children?: TreePatchInitDto[];
};

/**
 * Patch data for an existing tree node
 */
export type TreePatchDataDto = {
  path: TreePath;
  value: TreeValue;
};
/**
 * Patch props for updating an existing tree node
 */
export type TreePatchPropsDto = {
  path: TreePath;
  values: TreeObjectValue;
};
/**
 * Patch data for truncating the nested tree nodes.
 */
export type TreePatchTruncate = {
  length: number;
};
export type TreePatchTruncateDto = {
  path: TreePath;
  length: number;
};

export type TreePatch = {
  props?: TreeObjectValue;
  data?: TreeValue;
  replacements: Array<TreeInit & { index: number }>;
  appends: Array<TreeInit>;
  truncate?: number;
};
export type TreePatchDto = {
  props: TreePatchPropsDto[];
  data: TreePatchDataDto[];
  replacements: TreePatchInitDto[];
  appends: TreePatchInitDto[];
  truncates: TreePatchTruncateDto[];
};

export type TreeLocation<T extends TreeNode> = { parent: T; index: number };
