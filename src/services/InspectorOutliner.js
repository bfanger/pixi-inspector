const outliner = Symbol('outliner')

export default class InspectorOutliner {
  constructor (inspector) {
    this.inspector = inspector
    this.nodes = [{
      children: [],
      [outliner]: {
        id: 0,
        type: 'root',
        collapsed: false
      }
    }]
    // @todo Garbage collect nodes

    this.previousTree = {}

    this.inspector.registerHook(this.detectChanges.bind(this), 500)
  }

  select (id) {
    const node = this.nodes[id]
    if (node) {
      window.$pixi = node
    }
  }

  selected () {
    if (window.$pixi) {
      const id = window.$pixi[outliner].id
      if (this.nodes[id] && this.nodes[id] === window.$pixi) {
        return this.serialize(this.nodes[id])
      }
    }
    return false
  }

  tree () {
    return this.serialize(this.nodes[0])
  }

  expand (id) {
    const node = this.nodes[id]
    if (node) {
      node[outliner].collapsed = false
      return this.serialize(node).children
    }
  }
  collapse (id) {
    const node = this.nodes[id]
    if (node) {
      node[outliner].collapsed = true
      return this.serialize(node).children
    }
  }
  serialize (node) {
    if (typeof node[outliner] === 'undefined') {
      node[outliner] = {
        id: -1,
        type: this.inspector.typeDetection.detectType(node),
        collapsed: true,
        children: null
      }
      node[outliner].id = (this.nodes.push(node) - 1)
    }

    if (Array.isArray(node.children)) {
      if (node.children.length === 0) {
        node[outliner].children = false
      } else if (node[outliner].collapsed === false) {
        node[outliner].children = node.children.map(childNode => this.serialize(childNode))
      } else {
        node[outliner].children = true
      }
    } else {
      node[outliner].children = false
    }
    return node[outliner]
  }

  detectChanges (container, renderer) {
    const root = this.nodes[0]
    if (root.children.indexOf(container) === -1) { // container was rendered for the first time?
      root.children.push(container)
      this.serialize(container)
      container[outliner].collapsed = false // Auto expand root level
      this.inspector.emit('TREE', this.serialize(root))
      if (!window.$pixi) {
        this.select(container[outliner].id) // autoselect if nothing is selected
      }
    } else {
      const id = container[outliner].id
      if (hasChanged(container, this.previousTree[id])) {
        this.serialize(container)
        this.inspector.emit('TREE', root[outliner])
        this.previousTree[id] = container[outliner]
      }
    }
    // container[meta].lastRender = Date.now()
  }
}

function hasChanged (node, serialized) {
  if (!serialized) { // detect addition
    return true
  }
  if (node[outliner].id !== serialized.id) { // detect order change
    return true
  }
  if (!serialized.collapsed) {
    const length = node.children.length
    if (length !== serialized.children.length) { // detect child removal/addition
      return true
    }
    for (let i = 0; i < length; i++) {
      if (hasChanged(node.children[i], serialized.children[i])) { // detect nested change
        return true
      }
    }
  } else if (Array.isArray(node.children)) {
    if (node.children.length > 0 !== serialized.children) { // detect 1+ to 0 and 0 to 1+ children
      return true
    }
  } else if (serialized.children === true) { // detect child removal
    return true
  }
  return false
}
