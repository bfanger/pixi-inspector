
export const blacklist = ['children', 'parent', 'scope', 'cb', 'worldTransform', 'localTransform', 'vertexData', 'tempDisplayObjectParent']

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
    if (depth > 3) {
      return []
    }
    var type = typeof value
    if (type === 'string' || type === 'number' || type === 'boolean' || value === null) {
      return [{ path: path.join('.'), type, value }]
    } else if (type === 'object' && Array.isArray(value) === false) {
      depth++
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
      if (properties.length === 0) {
        return [{ path: path.join('.'), type: (typeof value.constructor ? value.constructor.name : type) }]
      }
      return properties
    } else {
      return [{ path: path.join('.'), type: (typeof value.constructor ? value.constructor.name : type) }]
    }
  }
}

function MismatchConstructor () { };

//     find (id, node) {
//       if (!node) {
//         node = this.root
//       }
//       if (!node._inspector) {
//         return false
//       }
//       if (node[symbol].id === id) {
//         return node
//       }
//       if (node.children) {
//         var length = node.children.length
//         for (var i = 0; i < length; i++) {
//           var found = this.find(id, node.children[i])
//           if (found) {
//             return found
//           }
//         }
//       }
//       return false
//     },

//     generateId () {
//       this._autoincrement++
//       return this._autoincrement
//     },

//     use (_PIXI) {
//       PIXI = _PIXI
//       inspector.patch(PIXI.CanvasRenderer)
//       inspector.patch(PIXI.WebGLRenderer)
//       // Prevent "Right-hand side of 'instanceof' is not an object" for older version of pixi
//       TransformBaseRef = typeof PIXI.TransformBase === 'function' ? PIXI.TransformBase : MismatchConstructor
//       ObservablePointRef = typeof PIXI.ObservablePoint === 'function' ? PIXI.ObservablePoint : MismatchConstructor
//     }
//   }
//   inspector.use(PIXI)

//   // Patch console.warn to hide
//   var windowPath = 'window'
//   var targetWindow = window
//   var framesMatch = path.match(/window.frames\[[0-9]+\]/)
//   if (framesMatch !== null) {
//     targetWindow = eval(framesMatch[0])
//     windowPath = framesMatch[0]
//   }
//   var _warn = targetWindow.console.warn
//   var _groupCollapsed = targetWindow.console.groupCollapsed
//   targetWindow.console.warn = function () { }
//   targetWindow.console.groupCollapsed = false

//   inspector.registerTypes('PIXI', PIXI, 2)
//   if (path.indexOf('Phaser') !== -1) {
//     inspector.registerTypes('Phaser', eval(windowPath + '.Phaser || false'), 2) // Register Phaser types
//   }
//   if (path.indexOf('game') !== -1) {
//     inspector.registerTypes('Panda', eval(windowPath + '.game || false'), 2) // Register Phaser types
//   }
//   targetWindow.console.warn = _warn
//   targetWindow.console.warn = _groupCollapsed
//   window.__PIXI_INSPECTOR_GLOBAL_HOOK1__ = inspector
// }())
