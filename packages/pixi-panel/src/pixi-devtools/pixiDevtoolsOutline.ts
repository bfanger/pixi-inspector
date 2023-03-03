import type { GameObjects, Scene } from "phaser";
import type { Container, DisplayObject } from "pixi.js";
import type { OutlinerNode, PixiDevtools } from "../types";

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
    name?: string;
  };

  /**
   * Get the metadata from a node or create it if it doesn't exist
   */
  function augment(node: DisplayObject | GameObjects.GameObject | Scene) {
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
    container: DisplayObject | GameObjects.GameObject
  ): DisplayObject | GameObjects.GameObject | undefined {
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
    const container = devtools.app
      ? ({ children: [root] } as any as Container)
      : ({ list: [root] } as any as GameObjects.Container);
    return findIn(path, container);
  }

  function buildTree(
    node: DisplayObject | GameObjects.GameObject | Scene
  ): OutlinerNode {
    const meta = augment(node);
    const tree: OutlinerNode = {
      id: meta.id,
      name: meta.name ?? node.constructor?.name ?? "anonymous",
      leaf: true,
      active: node === devtools.active(),
      visible: "visible" in node ? node.visible : undefined,
    };
    const container = node as Container;
    if (container.children?.length > 0) {
      tree.leaf = false;
      if (meta.expanded) {
        tree.children = devtools.childrenOf(node as Container)?.map(buildTree);
      }
    }
    return tree;
  }

  function expandNode(node: DisplayObject | GameObjects.GameObject) {
    const meta = augment(node);
    meta.expanded = true;
    const parent = devtools.parentOf(node);
    if (parent) {
      expandNode(parent);
    }
  }

  return {
    tree() {
      const meta = augment(devtools.root());
      if (!meta.name) {
        meta.expanded = true;
        if (devtools.app) {
          meta.name = "Stage";
        }
      }
      return buildTree(devtools.root());
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
