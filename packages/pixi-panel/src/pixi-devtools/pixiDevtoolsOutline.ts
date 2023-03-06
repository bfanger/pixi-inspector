import type { Container } from "pixi.js";
import type { OutlinerNode, PixiDevtools, UniversalNode } from "../types";

/**
 * Treeview operations
 */
export default function pixiDevtoolsOutline(devtools: PixiDevtools) {
  const metaProperty = Symbol("pixi-devtools-outline");

  devtools.on("activate", (node) => {
    if (node) {
      expandNode(node);
    }
  });

  function autoId() {
    autoId.current += 1;
    if (autoId.current > Number.MAX_SAFE_INTEGER) {
      autoId.current = 0;
    }
    return `${autoId.current}_${Math.floor(Math.random() * 4096).toString(16)}`;
  }
  autoId.current = 0;

  type Meta = {
    id: string;
    expanded: boolean;
  };

  /**
   * Get the metadata from a node or create it if it doesn't exist
   */
  function augment(node: UniversalNode) {
    let meta: Meta = (node as any)[metaProperty];
    if (meta) {
      return meta;
    }
    meta = {
      id: autoId(),
      expanded: false,
    };
    // eslint-disable-next-line no-param-reassign
    (node as any)[metaProperty] = meta;
    return meta;
  }

  function findIn(
    path: string[],
    container: UniversalNode
  ): UniversalNode | undefined {
    if (path.length === 0) {
      return container;
    }
    const id = path[0];
    const children = devtools.childrenOf(container);
    if (!children) {
      return undefined;
    }
    const node = children.find(
      (child) => (child as any)[metaProperty]?.id === id
    );
    if (node) {
      return findIn(path.slice(1), node);
    }
    return undefined;
  }

  function find(path: string[]) {
    const root = devtools.root();
    if (!root) {
      return undefined;
    }
    return findIn(path, { children: [root] } as any as Container);
  }

  function buildTree(node: UniversalNode): OutlinerNode {
    const meta = augment(node);
    let name = "";
    if ("name" in node && node.name !== null && node.name !== "") {
      if (node.constructor?.name) {
        name += `${node.constructor.name} `;
      }
      name += `"${node.name}"`;
    }
    if (!name) {
      name = node.constructor?.name ?? "anonymous";
    }
    const tree: OutlinerNode = {
      id: meta.id,
      name,
      leaf: true,
      active: node === devtools.active(),
      visible: "visible" in node ? node.visible : undefined,
    };
    const children = devtools.childrenOf(node) ?? [];
    if (children.length > 0) {
      tree.leaf = false;
      if (meta.expanded) {
        tree.children = children.map(buildTree);
      }
    }
    return tree;
  }

  function expandNode(node: UniversalNode) {
    const meta = augment(node);
    meta.expanded = true;
    const parent = devtools.parentOf(node);
    if (parent) {
      expandNode(parent);
    }
  }

  return {
    tree(): OutlinerNode {
      const root = devtools.root();
      if (!root) {
        return {
          id: "disconnected",
          active: false,
          leaf: true,
          name: "(disconnected))",
          visible: false,
        };
      }
      if (!(root as any)[metaProperty]) {
        const meta = augment(root);
        meta.expanded = true;
      }

      return buildTree(root);
    },
    expand(path: string[]) {
      const node = find(path);
      if (node) {
        augment(node).expanded = true;
      }
    },
    collapse(path: string[]) {
      const node = find(path);
      if (node) {
        augment(node).expanded = false;
      }
    },
    hide(path: string[]) {
      const node = find(path);
      if (node && "visible" in node) {
        node.visible = false;
      }
    },
    show(path: string[]) {
      const node = find(path);
      if (node && "visible" in node) {
        node.visible = true;
      }
    },
    activate(path: string[]) {
      devtools.activate(find(path));
    },
  };
}
