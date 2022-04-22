import type { Application, Container, DisplayObject } from "pixi.js";
import type { OutlinerNode } from "./types";

export default function createPixiDevtools() {
  const devtools = Symbol("devtools");
  function getApp(): Application {
    const app =
      // eslint-disable-next-line no-underscore-dangle
      (window as any).__PIXI_APP__ || (window.frames[0] as any)?.__PIXI_APP__;
    if (!app) {
      throw new Error("__PIXI_APP__ not a PIXI.Application");
    }
    return app;
  }
  function getStage() {
    const { stage } = getApp();
    if (stage[devtools] === undefined) {
      const meta = buildMeta(stage);
      meta.expanded = true;
      meta.name = "Stage";
      if (!(window as any).$pixi) {
        (window as any).$pixi = stage;
      }
    }
    return stage;
  }

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
  function buildMeta(node: DisplayObject): Meta {
    let meta: Meta = node[devtools];
    if (meta) {
      return meta;
    }
    meta = {
      id: autoId(),
      expanded: false,
    };
    // eslint-disable-next-line no-param-reassign
    node[devtools] = meta;
    return meta;
  }

  function buildTree(node: DisplayObject): OutlinerNode {
    const meta = buildMeta(node);
    const tree: OutlinerNode = {
      id: meta.id,
      name: meta.name || node.constructor.name,
      leaf: true,
      active: node === (window as any).$pixi,
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
      return undefined;
    }
    return findBySubpath(path.slice(1), stage);
  }

  function highlight() {
    // @todo Scale and offset
    const div = document.createElement("div");
    Object.assign(div.style, {
      position: "absolute",
      top: "0",
      left: "0",
      width: "0",
      height: "0",
      border: "3px solid #ffaf29",
      pointerEvents: "none",
    });
    document.body.appendChild(div);
    let prevSize = { width: -1, height: -1 };
    getApp().ticker.add(() => {
      const $pixi = (window as any).$pixi as DisplayObject;
      if (!$pixi) {
        div.style.transform = "scale(0)";
        return;
      }
      if (!$pixi.parent || $pixi.visible === false) {
        div.style.transform = "scale(0)";
        return;
      }
      const size = $pixi.getLocalBounds();
      if (prevSize.width !== size.width && prevSize.height !== size.height) {
        prevSize = { width: size.width, height: size.height };
        div.style.width = `${size.width}px`;
        div.style.height = `${size.height}px`;
      }
      const m = $pixi.worldTransform;
      const offset = `translate(${size.x - 3}px, ${size.y - 3}px)`;
      div.style.transform = `matrix(${m.a}, ${m.b}, ${m.c}, ${m.d}, ${m.tx}, ${m.ty}) ${offset}`;
      div.style.transformOrigin = "top left";
    });
  }
  highlight();

  return {
    tree() {
      return buildTree(getStage());
    },
    expandByPath(path: string[]) {
      const node = findByPath(path);
      if (node) {
        node[devtools].expanded = true;
      }
    },
    collapseByPath(path: string[]) {
      const node = findByPath(path);
      if (node) {
        node[devtools].expanded = false;
      }
    },
    activateByPath(path: string[]) {
      (window as any).$pixi = findByPath(path);
    },
    hideByPath(path: string[]) {
      const node = findByPath(path);
      if (node) {
        node.visible = false;
      }
    },
    showByPath(path: string[]) {
      const node = findByPath(path);
      if (node) {
        node.visible = true;
      }
    },
  };
}
