export type TreeNode = TreeControllerNode | TreeDisplayNode;

/**
 * TreeNode inside the inspected page, connected to an game entity or a property of an entity
 */
export type TreeControllerNode = {
  children?: TreeControllerNode[];
  sync?: (patch: TreePatch) => void;
  setValue?: (value: TreeValue) => void;
  events?: Record<
    string,
    TreeEventHandler | [TreeEventHandler, { throttle?: number }]
  >;
};
/**
 * TreeNode inside DevTools, connected to a (Svelte) Component
 */
export type TreeDisplayNode = TreeDisplayContainerNode | TreeDisplayLeafNode;
export type TreeDisplayLeafNode = {
  readonly path: TreePath;
  setProps(props: TreeObjectValue): void;
  setValue?: (value: TreeValue) => void;
};
export type TreeDisplayContainerNode = {
  readonly path: TreePath;
  setProps(props: TreeObjectValue): void;
  setValue?: (value: TreeValue) => void;
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

type TreeEventHandler = (details?: TreeValue) => number | void | undefined;

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
  value?: TreeValue;
  children?: TreeInit[];
};
/**
 * Patch to create a new tree node
 */
export type TreePatchInitDto = {
  path: TreePath;
  component: string;
  props: TreeObjectValue;
  value?: TreeValue;
  setValue?: true;
  events?: { event: string; throttle?: number }[];
  children?: TreePatchInitDto[];
};

/**
 * Patch data for an existing tree node
 */
export type TreePatchValueDto = {
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
  value?: TreeValue;
  replacements: Array<TreeInit & { index: number }>;
  appends: Array<TreeInit>;
  truncate?: number;
};
export type TreePatchDto = {
  props: TreePatchPropsDto[];
  value: TreePatchValueDto[];
  replacements: TreePatchInitDto[];
  appends: TreePatchInitDto[];
  truncates: TreePatchTruncateDto[];
};

export type TreeLocation<T extends TreeNode> = { parent: T; index: number };

/**
 * A connection is used by a Sender (DisplayTree) to communicate with a receiver (ControllerTree).
 *
 * The sender must display the UI that is requested by the receiver.
 * The receiver cannot start a conversation, but has synchronous access to the actual javascript objects.
 * The receiver is in control of "what" will be displayed by the sender, but is not responsible for displaying the ui.
 * The receivers responsibility is to respond to syncs & events from the sender and respond with updates to the tree.
 */
export type Connection = {
  /**
   * Send values to existing nodes.
   */
  set: (values: TreePatchValueDto[]) => Promise<void>;

  /**
   * Send values to existing nodes, dispatch an event to a node and update the tree based on the event response.
   */
  dispatchEvent: (
    values: TreePatchValueDto[],
    event: TreeEvent,
  ) => Promise<TreePatchDto>;

  /**
   * Send values to existing nodes & update part of the the tree.
   */
  sync: (values: TreePatchValueDto[], path: TreePath) => Promise<TreePatchDto>;
};

/**
 * The sender sends any pending data changes along with an event or sync.
 * This is because the tree can be out of sync after the event/sync.
 * Which minimizes the amount of errors and requests.
 */
export type Sender = {
  dispatchEvent: (
    node: TreeDisplayNode,
    event: string,
    details?: TreeValue,
  ) => Promise<void>;
  setValue: (node: TreeDisplayNode, value: TreeValue) => Promise<void>;
  sync(node?: TreeDisplayNode): Promise<void>;
  reset: () => Promise<void>;
};
