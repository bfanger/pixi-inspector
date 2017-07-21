export default class TypeDetection {
  constructor () {
    this.constructors = []
    this.names = []
  }

  detectType (node) {
    if (!node.constructor) {
      return 'Unknown'
    }
    var index = this.constructors.indexOf(node.constructor)
    if (index === -1) {
      return node.constructor.name || 'Anonymous'
    }
    return this.names[index]
  }

  registerTypes (name, object, depth = 1) {
    if (depth === 0 || typeof object !== 'object') {
      return
    }
    for (var prop in object) {
      if (typeof object[prop] === 'function') {
        this.constructors.push(object[prop])
        this.names.push(name + prop)
      } else if (typeof object[prop] === 'object') {
        this.registerTypes(name + prop + '.', object[prop], depth - 1)
      }
    }
  }
}
