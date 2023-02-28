import type { Container, DisplayObject } from "pixi.js";
import type { OutlinerNode, PixiDevtools } from "../types";

/**
 * Treeview operations
 */
export default function pixiDevtoolsOutline(devtools: PixiDevtools) {
  const metaProperty = Symbol("outline");

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
    name?: string;
  };

  /**
   * Get the metadata from a node or create it if it doesn't exist
   */
  function augment(node: DisplayObject) {
    let meta: Meta = node[metaProperty];
    if (meta) {
      return meta;
    }
    meta = {
      id: autoId(),
      expanded: false,
    };
    // eslint-disable-next-line no-param-reassign
    node[metaProperty] = meta;
    return meta;
  }

  function findIn(path: string[], container: DisplayObject) {
    if (path.length === 0) {
      return container;
    }
    const id = path[0];
    const node = (container as Container).children?.find(
      (c) => c[metaProperty]?.id === id
    );
    if (node) {
      return findIn(path.slice(1), node);
    }
    return undefined;
  }

  function find(path: string[]) {
    return findIn(path, {
      children: [devtools.app?.stage],
    } as any as Container);
  }

  function buildTree(node: DisplayObject): OutlinerNode {
    const meta = augment(node);
    const tree: OutlinerNode = {
      id: meta.id,
      name: meta.name ?? node.constructor?.name ?? "anonymous",
      leaf: true,
      active: node === globalThis.$pixi,
      visible: node.visible,
    };
    const container = node as Container;
    if (container.children?.length > 0) {
      tree.leaf = false;
      if (meta.expanded) {
        tree.children = (node as Container).children.map(buildTree);
      }
    }
    return tree;
  }
  return {
    tree() {
      if (!devtools.app) {
        throw new Error("__PIXI_APP__ not a PIXI.Application");
      }
      const meta = augment(devtools.app.stage);
      if (!meta.name) {
        meta.expanded = true;
        meta.name = "Stage";
        globalThis.$pixi = devtools.app.stage;
      }
      return buildTree(devtools.app.stage);
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
      if (node) {
        node.visible = false;
      }
    },
    show(path: string[]) {
      const node = find(path);
      if (node) {
        node.visible = true;
      }
    },
    activate(path: string[]) {
      globalThis.$pixi = find(path);
    },
  };
}
