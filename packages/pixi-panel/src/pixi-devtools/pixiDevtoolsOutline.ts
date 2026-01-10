import type { Container } from "pixi.js";
import type { OutlinerNode, PixiDevtools, UniversalNode } from "../types";

/**
 * Treeview operations
 */
export default function pixiDevtoolsOutline(devtools: PixiDevtools) {
  const metaPropertyMap = new WeakMap<UniversalNode, Meta>();

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
    if (!metaPropertyMap.has(node)) {
      const newMeta = {
        id: autoId(),
        expanded: false,
      };
      metaPropertyMap.set(node, newMeta);
      return newMeta;
    }

    return metaPropertyMap.get(node)!;
  }

  function findIn(
    path: string[],
    container: UniversalNode,
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
      (child) => metaPropertyMap.get(child)?.id === id,
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

  function buildName(node: UniversalNode) {
    if (devtools.inVersionRange(8)) {
      if ("label" in node && node.label) {
        if (node.label === "Sprite") {
          return node.label;
        }
        if (node.constructor.name) {
          return `${node.constructor.name} "${node.label}"`;
        }
        return `"${node.label}"`;
      }
    } else if ("name" in node && node.name) {
      if (node.constructor.name) {
        return `${node.constructor.name} "${node.name}"`;
      }
      return `"${node.name}"`;
    }
    return node.constructor.name ?? "anonymous";
  }

  function buildTree(node: UniversalNode): OutlinerNode {
    const meta = augment(node);

    const tree: OutlinerNode = {
      id: meta.id,
      name: buildName(node),
      leaf: true,
      active: node === devtools.selection.active(),
      selectable: devtools.selection.selectable(node),
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

  /**
   *
   * @param query Lower case version of the query
   * @param node Node to search
   * @returns
   */
  function searchResults(query: string, node: UniversalNode): OutlinerNode {
    const meta = augment(node);
    const name = buildName(node);
    const match = name.toLowerCase().indexOf(query) !== -1;
    const children = devtools.childrenOf(node);
    if (!children || children.length === 0) {
      return {
        id: meta.id,
        active: node === devtools.selection.active(),
        selectable: devtools.selection.selectable(node),
        leaf: true,
        name,
        visible: "visible" in node ? node.visible : undefined,
        match,
      };
    }

    const results: OutlinerNode[] = [];
    for (const child of children) {
      const result = searchResults(query, child);
      if (result.match !== false) {
        results.push(result);
      }
    }

    return {
      id: meta.id,
      active: node === devtools.selection.active(),
      selectable: devtools.selection.selectable(node),
      leaf: false,
      name,
      match: !match && results.length !== 0 ? undefined : match,
      visible: "visible" in node ? node.visible : undefined,
      children: results,
    };
  }

  return {
    query: "",

    tree(): OutlinerNode {
      const root = devtools.root();
      if (!root) {
        return {
          id: "disconnected",
          active: false,
          selectable: false,
          leaf: true,
          name: "(disconnected))",
          visible: false,
        };
      }
      if (!metaPropertyMap.has(root)) {
        augment(root).expanded = true;
      }
      if (this.query) {
        return searchResults(this.query.toLowerCase(), root);
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
    selectable(path: string[]) {
      const node = find(path);
      if (node) {
        devtools.selection.enable(node);
      }
    },
    unselectable(path: string[]) {
      const node = find(path);
      if (node) {
        devtools.selection.disable(node);
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
      devtools.selection.activate(find(path));
    },
    highlight(path: string[]) {
      devtools.selection.highlight(find(path));
    },
    log(path: string[]) {
      const node = find(path);
      if (node) {
        console.info(node);
      }
    },
    expandParentsFor(node: UniversalNode) {
      const parent = devtools.parentOf(node);
      if (parent) {
        augment(parent).expanded = true;
        this.expandParentsFor(parent);
      }
    },
  };
}
