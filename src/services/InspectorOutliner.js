/**
 * Backend for the outliner / TreeView
 * - Performs selection / expand / collapse
 * - Detects changes in tree
 * - Serializes the tree for display in the outliner
 */
import InspectorHighlight from "./InspectorHighlight";

const outliner = Symbol("outliner");

export default class InspectorOutliner {
  constructor(inspector) {
    this.inspector = inspector;
    this.root = {
      children: [],
      [outliner]: {
        id: 0,
        type: "root",
        collapsed: false,
        parent: null
      }
    };
    this.nodes = [this.root];
    // @todo Garbage collect nodes

    this.previousTree = {};

    this.inspector.registerHook("beforeRender", this.detectScene.bind(this));
    this.inspector.registerHook(
      "beforeRender",
      this.detectChanges.bind(this),
      250
    );

    this.inspector.gui.rightclick$.subscribe(({ x, y }) => {
      const point = new inspector.instance.PIXI.Point(x, y);
      if (this.root.children.length) {
        for (let i = this.root.children.length - 1; i >= 0; i--) {
          const node = this.nodeAt(this.root.children[i], point);
          if (node) {
            window.$pixi = node;
            InspectorHighlight.node = node;
            this.inspector.emit("SELECTED", this.serialize(node));
            let parent = node;
            while (parent.parent) {
              parent = parent.parent;
              if (!parent[outliner]) {
                this.serialize(parent);
              }
              parent[outliner].collapsed = false; // expand to show the selection
            }
            this.inspector.emit("TREE", this.serialize(this.root));
            break;
          }
        }
      }
    });
  }

  select(id) {
    const node = this.nodes[id];
    if (node) {
      window.$pixi = node;
      InspectorHighlight.node = node;
    }
  }

  selected() {
    if (window.$pixi) {
      const id = window.$pixi[outliner].id;
      if (this.nodes[id] && this.nodes[id] === window.$pixi) {
        return this.serialize(this.nodes[id]);
      }
    }
    return false;
  }

  tree() {
    return this.serialize(this.root);
  }

  expand(id) {
    const node = this.nodes[id];
    if (node) {
      node[outliner].collapsed = false;
      return this.serialize(node).children;
    }
  }
  collapse(id) {
    const node = this.nodes[id];
    if (node) {
      node[outliner].collapsed = true;
      return this.serialize(node).children;
    }
  }

  highlight(id) {
    const node = this.nodes[id];
    if (node) {
      InspectorHighlight.node = node;
    } else {
      InspectorHighlight.node = false;
    }
  }

  detectScene(container) {
    if (this.root.children.indexOf(container) === -1) {
      // container was rendered for the first time?
      this.root.children.push(container);
      this.serialize(container);
      container[outliner].collapsed = false; // Auto expand root level
      this.inspector.emit("TREE", this.serialize(this.root));
      if (!window.$pixi) {
        window.$pixi = container; // autoselect if nothing is selected
        this.inspector.emit("SELECTED", this.serialize(container));
      }
    }
  }

  detectChanges(container) {
    if (container[outliner]) {
      const id = container[outliner].id;
      if (hasChanged(container, this.previousTree[id])) {
        this.serialize(container);
        this.inspector.emit("TREE", this.root[outliner]);
        this.previousTree[id] = container[outliner];
      }
    }
    // container[meta].lastRender = Date.now()
  }

  nodeAt(node, point) {
    if (node.visible === false) {
      // || node.renderable === false
      return false;
    }
    if (node.children && node.children.length) {
      for (let i = node.children.length - 1; i >= 0; i--) {
        const found = this.nodeAt(node.children[i], point);
        if (found) {
          return found;
        }
      }
    }
    if (node.containsPoint) {
      if (node.containsPoint(point)) {
        return node;
      }
    } else if (node.getBounds && node.getBounds().contains(point.x, point.y)) {
      return node;
    }
    return false;
  }

  serialize(node) {
    if (typeof node[outliner] === "undefined") {
      node[outliner] = {
        id: -1,
        name: node.name,
        type: this.inspector.typeDetection.detectType(node),
        collapsed:
          node.parent && node.parent[outliner]
            ? node.parent[outliner].parent !== null
            : false,
        children: null
      };
      node[outliner].id = this.nodes.push(node) - 1;
    }
    if (node.parent && node.parent[outliner]) {
      node[outliner].parent = node.parent[outliner].id;
    } else {
      node[outliner].parent = null;
    }

    if (Array.isArray(node.children)) {
      if (node.children.length === 0) {
        node[outliner].children = false;
      } else if (node[outliner].collapsed === false) {
        node[outliner].children = node.children.map(childNode =>
          this.serialize(childNode)
        );
      } else {
        node[outliner].children = true;
      }
    } else {
      node[outliner].children = false;
    }
    return node[outliner];
  }
}

function hasChanged(node, serialized) {
  if (!serialized) {
    // detect addition
    return true;
  }
  if (!node[outliner]) {
    // not serialized before
    return true;
  }
  if (node[outliner].id !== serialized.id) {
    // detect order change
    return true;
  }
  if (!serialized.collapsed) {
    const length = node.children.length;
    if (length !== serialized.children.length) {
      // detect child removal/addition
      return true;
    }
    for (let i = 0; i < length; i++) {
      if (hasChanged(node.children[i], serialized.children[i])) {
        // detect nested change
        return true;
      }
    }
  } else if (Array.isArray(node.children)) {
    if (node.children.length > 0 !== serialized.children) {
      // detect 1+ to 0 and 0 to 1+ children
      return true;
    }
  } else if (serialized.children === true) {
    // detect child removal
    return true;
  }
  return false;
}
