import ui from "./ui";

export type TreeComponent = keyof typeof ui;
/**
 * The tree object that exists on both sides and will be kept in sync.
 * - On the DevTools side the ref is connected to the input element
 * - On the Game side the ref is connected to an property of an entity
 */
export type TreeNode<T> = {
  component: TreeComponent;
  attributes: TreeDataObject;
  data: TreeData;
  path: TreePath;
  ref: T;
  nested: TreeNode<T>[];
};

// JSON-compatible data type
export type TreeData =
  | string
  | number
  | boolean
  | null
  | undefined
  | TreeDataObject
  | TreeDataArray;
type TreeDataObject = {
  [key: string]: TreeData;
};
type TreeDataArray = Array<TreeData>;

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

/**
 * Patch data for a new tree node
 */
export type TreePatchCreate = {
  component: TreeComponent;
  attributes: TreeDataObject;
  data: TreeData;
  nested?: TreePatchCreate[];
};

export type TreePatchCreateDto = {
  p: TreePath;
  c: TreeComponent;
  a: TreeDataObject;
  d: TreeData;
  n?: TreePatchCreateDto[];
};

/**
 * Patch data for updating an existing tree node
 * Either attributes and/or data contain the new values.
 */
export type TreePatchUpdate = {
  attributes?: TreeDataObject;
  data?: TreeData;
};
export type TreePatchUpdateDto = {
  p: TreePath;
  a?: TreeDataObject;
  d?: TreeData;
};
/**
 * Patch data for truncating the nested tree nodes.
 */
export type TreePatchTruncateDto = {
  p: TreePath;
  l: number;
};
export type TreeDiff = {
  updates: TreePatchUpdateDto[];
  replacements: TreePatchCreateDto[];
  appends: TreePatchCreateDto[];
  truncates: TreePatchTruncateDto[];
};

export type TreeLocation<T> = { parent: TreeNode<T>; index: number };

export type TreePatchOptions<T> = {
  createRef?: (data: TreePatchCreateDto, location: TreeLocation<T>) => T;
  onUpdateAttributes?: (node: TreeNode<T>, attributes: TreeDataObject) => void;
  onUpdateData?: (node: TreeNode<T>, data: TreeData) => void;
  onReplace?: (node: TreeNode<T>, location: TreeLocation<T>) => void;
  onAppend?: (node: TreeNode<T>, location: TreeLocation<T>) => void;
  onTruncate?: (parent: TreeNode<T>, length: number) => void;
};

export type TreeDiffMutations = {
  update: (patch: TreePatchUpdate) => void;
  append: (patch: TreePatchCreate) => void;
  replace: (patch: TreePatchCreate) => void;
  truncate: (length: number) => void;
};
