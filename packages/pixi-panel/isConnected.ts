import type { Application, Container, DisplayObject } from "pixi.js";
import { Readable, readable } from "svelte/store";
import type { Bridge, OutlineNode } from "./types";

export default function isConnected(bridge: Bridge): Readable<boolean> {
  async function findPixiApp() {
    try {
      const type = await bridge.execute(
        "typeof window['__PIXI_APP__'] + '-' + typeof window['__PIXI_DEVTOOLS__']"
      );
      if (type === "object-object") {
        return true;
      } else if (type === "object-undefined") {
        await bridge.inject("__PIXI_DEVTOOLS__", devToolFactory);
        return true;
      }
      return false;
    } catch (err) {
      return false;
    }
  }
  return readable<boolean>(false, (set) => {
    const timer = setInterval(async () => {
      set(await findPixiApp());
    }, 10000);
    findPixiApp().then(set);
    return () => clearInterval(timer);
  });
}

const devToolFactory = function () {
  const devtools = Symbol("devtools");
  function getApp(): Application {
    const app = window["__PIXI_APP__"];
    if (!app) {
      throw new Error("__PIXI_APP__ not a PIXI.Application");
    }
    return app;
  }
  function getStage() {
    const stage = getApp().stage;
    if (stage[devtools] === undefined) {
      const meta = buildMeta(stage);
      meta.expanded = true;
      meta.name = "Stage";
      if (!window["$pixi"]) {
        window["$pixi"] = stage;
      }
    }
    return stage;
  }

  function autoId() {
    autoId.current += 1;
    if (autoId.current > Number.MAX_SAFE_INTEGER) {
      autoId.current = 0;
    }
    return autoId.current + "_" + Math.floor(Math.random() * 4096).toString(16);
  }
  autoId.current = 0;

  type Meta = {
    id: string;
    expanded: boolean;
    name?: string;
  };
  function buildMeta(node: DisplayObject): Meta {
    let meta: Meta = node[devtools];
    if (meta) {
      return meta;
    }
    meta = {
      id: autoId(),
      expanded: false,
    };
    node[devtools] = meta;
    return meta;
  }

  function buildTree(node: DisplayObject): OutlineNode {
    const meta = buildMeta(node);
    const tree: OutlineNode = {
      id: meta.id,
      name: meta.name || node.constructor.name,
      leaf: true,
      active: node === window["$pixi"],
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

  function findBySubpath(subpath: string[], container: DisplayObject) {
    if (subpath.length === 0) {
      return container;
    }
    const id = subpath[0];
    const node = (container as Container).children?.find(
      (c) => c[devtools]?.id === id
    );
    if (node) {
      return findBySubpath(subpath.slice(1), node);
    }
    return undefined;
  }

  function findByPath(path: string[]) {
    const id = path[0];
    const stage = getStage();
    if (stage[devtools].id !== id) {
      return;
    }
    return findBySubpath(path.slice(1), stage);
  }

  return {
    outlineTree() {
      return buildTree(getStage());
    },
    outlineExpand(path: string[]) {
      const node = findByPath(path);
      if (node) {
        node[devtools].expanded = true;
      }
    },
    outlineCollapse(path: string[]) {
      const node = findByPath(path);
      if (node) {
        node[devtools].expanded = false;
        // @todo Also collapse children?
      }
    },
  };
};
