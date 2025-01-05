import ui from "./ui";

export type TreeComponent = keyof typeof ui;
export type TreePath = number[];

export type JSONValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | JSONObject
  | JSONArray;
type JSONObject = {
  [key: string]: JSONValue;
};
type JSONArray = Array<JSONValue>;

export type TreePatchAdd = {
  p: TreePath;
  c: TreeComponent;
  a: JSONObject;
  d: JSONValue;
  n?: TreePatchAdd[];
};
export type TreePatchUpdate = {
  p: TreePath;
  a?: JSONObject;
  d?: JSONValue;
};
export type PatchTruncates = {
  p: TreePath;
  l: number;
};
export type TreeDiff = {
  updates?: TreePatchUpdate[];
  replacements?: TreePatchAdd[];
  appends?: TreePatchAdd[];
  truncates?: PatchTruncates[];
};

export type TreeNode<T> = {
  component: TreeComponent;
  attributes: JSONObject;
  data: JSONValue;
  ref: T;
  nested: TreeNode<T>[];
};
export type TreeParentNode<T> = {
  ref: T;
  nested: TreeNode<T>[];
};

export type TreeLocation<T> = { parent: TreeParentNode<T>; index: number };

export type TreePatcher<T> = {
  createRef: (data: TreePatchAdd, location: TreeLocation<T>) => T;
  onUpdateAttributes?: (node: TreeNode<T>, attributes: JSONObject) => void;
  onUpdateData?: (node: TreeNode<T>, data: JSONValue) => void;
  onReplace?: (node: TreeNode<T>, location: TreeLocation<T>) => void;
  onAppend?: (node: TreeNode<T>, location: TreeLocation<T>) => void;
  onTruncate?: (parent: TreeNode<T>, length: number) => void;
};
