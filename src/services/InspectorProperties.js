
export const blacklist = ['children', 'parent', 'tempDisplayObjectParent']
export const whitelist = ['transform', 'position', 'scale', 'rotation', 'pivot', 'skew', 'anchor']
export default class InspectorProperties {
  constructor (inspector) {
    // this.TransformBaseRef = typeof inspector.PIXI.TransformBase === 'function' ? inspector.PIXI.TransformBase : MismatchConstructor
    this.ObservablePointRef = typeof inspector.PIXI.ObservablePoint === 'function' ? inspector.PIXI.ObservablePoint : MismatchConstructor
    // this.Point = inspector.PIXI.Point
  }

  all () {
    if (!window.$pixi) {
      return []
    }
    return this.serialize(window.$pixi, [], 0)
  }
  set (path, value) {
    /* eslint-disable no-eval */
    eval('$pixi.' + path + ' = ' + JSON.stringify(value))
    /* eslint-enable */
  }

  serialize (value, path, depth) {
    if (depth >= 3) {
      return []
    }
    var type = typeof value
    if (type === 'string' || type === 'number' || type === 'boolean' || value === null) {
      return [{ path: path.join('.'), type, value }]
    } else if (type === 'object' && Array.isArray(value) === false) {
      depth++
      if (depth === 1 || whitelist.indexOf(path[path.length - 1]) !== -1) {
        const properties = []
        Object.keys(value).forEach(property => {
          if (property[0] === '_' || blacklist.indexOf(property) !== -1) {
            return
          }
          properties.push(...this.serialize(value[property], [...path, property], depth))
        })
        if (value instanceof this.ObservablePointRef) {
          properties.push({
            path: path.join('.') + '.x', type: 'number', value: value.x
          }, {
            path: path.join('.') + '.y', type: 'number', value: value.y
          })
        }
        if (properties.length !== 0) {
          return properties
        }
      }
      return [{ path: path.join('.'), type: (typeof value.constructor ? (value.constructor.name || type) : type) }]
    } else if (type === 'undefined') {
      return [{ path: path.join('.'), type }]
    } else {
      return [{ path: path.join('.'), type: (typeof value.constructor ? (value.constructor.name || type) : type) }]
    }
  }
}

function MismatchConstructor () { };
