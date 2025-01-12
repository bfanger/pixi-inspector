import ui from "./ui";

export type TreeNode = TreeControllerNode | TreeDisplayNode;

/**
 * TreeNode inside the inspected page, connected to an game entity or a property of an entity
 */
export type TreeControllerNode = {
  // path: TreePath;
  children?: TreeControllerNode[];
  sync(out: TreePatch): void;
  setData?(data: TreeData): void;
  dispatchEvent?(event: TreeEvent): TreePatchDto;
};
/**
 * TreeNode inside DevTools, connected to a (Svelte) Component
 */
export type TreeDisplayNode = TreeDisplayContainerNode | TreeDisplayLeafNode;
export type TreeDisplayLeafNode = {
  setProps(props: TreeDataObject): void;
  setData(data: TreeData): void;
};
export type TreeDisplayContainerNode = {
  setProps(props: TreeDataObject): void;
  setData(data: TreeData): void;
  children: TreeDisplayNode[];
  setChild(index: number, init: TreePatchInitDto): TreeDisplayNode;
  truncate(length: number): void;
};

export type TreeEvent = { event: string; data?: TreeData };

// JSON-compatible data type
export type TreeData =
  | string
  | number
  | boolean
  | null
  | undefined
  | TreeDataObject
  | TreeDataArray;
export type TreeDataObject = {
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

export type TreeComponent = keyof typeof ui;

export type TreeInit = {
  node: TreeControllerNode;
  component: TreeComponent;
  props: TreeDataObject;
  data: TreeData;
  children?: TreeInit[];
};
/**
 * Patch data for a new tree node
 */
export type TreePatchInitDto = {
  path: TreePath;
  component: TreeComponent;
  props: TreeDataObject;
  data: TreeData;
  children?: TreePatchInitDto[];
};

/**
 * Patch data for an existing tree node
 */
export type TreePatchDataDto = {
  path: TreePath;
  data?: TreeData;
};
/**
 * Patch props for updating an existing tree node
 */
export type TreePatchPropsDto = {
  path: TreePath;
  props: TreeDataObject;
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
  props?: TreeDataObject;
  data?: TreeData;
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
