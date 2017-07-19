import { meta } from './Inspector'

export default class InspectorOutliner {
  constructor (inspector) {
    this.inspector = inspector
    this.previousTree = {}

    this.inspector.registerHook(this.detectChanges.bind(this), 500)
  }

  detectChanges (container, renderer) {
    if (this.inspector.nodes[0].children.indexOf(container) === -1) {
      // the container was rendered the first time
      this.inspector.nodes[0].children.push(container)
      this.inspector.serialize(container)
      container[meta].collapsed = false // Auto expand root level
      if (!window.$pixi) {
        this.inspector.select(container[meta].id) // autoselect if nothing is selected
      }
    }
    // container[meta].lastRender = Date.now()
    const tree = this.virtualTree(container)
    const id = container[meta].id
    if (arrayDiff(tree, this.previousTree[id])) {
      this.previousTree[id] = tree
      this.inspector.emit('TREE', this.inspector.tree())
    }
  }

  virtualTree (node) {
    const props = node[meta] || this.inspector.serialize(node)
    const tree = [props.id]
    if (props.collapsed === false) {
      tree.push(node.children.map(child => this.virtualTree(child)))
    }
    return tree
  }
}

function arrayDiff (arrayA, arrayB) {
  if (!arrayB) {
    return true
  }
  const length = arrayA.length
  if (length !== arrayB.length) {
    return true
  }
  for (let i = 0; i < length; i++) {
    const itemA = arrayA[i]
    const type = typeof itemA
    const itemB = arrayB[i]
    if (type !== typeof itemB) {
      return true
    }
    if (type === 'object') {
      if (arrayDiff(itemA, itemB)) {
        return true
      }
    } else if (itemA !== itemB) {
      return true
    }
  }
  return false
}
