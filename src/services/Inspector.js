import TypeDetection from './TypeDetection'
import Outliner from './InspectorOutliner'

export default class Inspector {
  constructor (instance, emit) {
    this.PIXI = instance.PIXI
    this.emit = emit
    this.unpatched = {}

    this.typeDetection = new TypeDetection()
    this.typeDetection.registerTypes('PIXI', instance.PIXI)
    instance.Phaser && this.typeDetection.registerTypes('Phaser', instance.Phaser)
    this.hooks = []
    this.outliner = new Outliner(this)
  }

  activate () {
    if (!this.unpatched['CanvasRenderer']) {
      this.patch('CanvasRenderer')
    }
    if (!this.unpatched['WebGLRenderer']) {
      this.patch('WebGLRenderer')
    }
  }

  deactivate () {
    for (const [renderer, renderMethod] of Object.entries(this.unpatched)) {
      this.PIXI[renderer].prototype.render = renderMethod
    }
    this.unpatched = {}
  }

  /**
   * Path the Renderer.render method to get a hold of the stage object(s)
   */
  patch (renderer) {
    if (this.unpatched[renderer]) {
      console.warn(renderer + ' already patched')
      return
    }
    const Renderer = this.PIXI[renderer]
    if (Renderer && Renderer.prototype.render) {
      const renderMethod = Renderer.prototype.render
      this.unpatched[renderer] = renderMethod
      var self = this
      Renderer.prototype.render = function (container) {
        for (const hook of self.hooks) {
          if (hook.skip) {
            continue
          }
          hook.callback(container, renderer)
          if (hook.throttle) {
            hook.skip = true
            setTimeout(() => {
              hook.skip = false
            }, hook.throttle)
          }
        }
        return renderMethod.apply(this, arguments)
      }
    }
  }

  /**
   * @param {Function} callback
   * @param {number} ms
   * @return {Function} unregister
   */
  registerHook (callback, ms = 0) {
    const hook = {
      callback: callback,
      throttle: ms,
      skip: false
    }
    this.hooks.push(hook)
    return () => {
      const index = this.hooks.indexOf(hook)
      if (index !== -1) {
        this.hooks.splice(index, 1)
      }
    }
  }
}

//   function MismatchConstructor () { };
//   var TransformBaseRef = MismatchConstructor
//   var ObservablePointRef = MismatchConstructor

//   var inspector = {

//     selectMode: false,

//     _highlight: {
//       node: false,
//       stage: false,
//       point: false,
//       graphics: PIXI.Graphics ? new PIXI.Graphics() : false // Only supported in PIXI v3
//     },
//     _autoincrement: 1,

//     /**
// 		 * Aggregate results  for services/scene.js
// 		 */
//     scene () {
//       var scene = {
//         tree: this.tree(),
//         selectMode: this.selectMode,
//         selected: false,
//         hover: false,
//         context: {}
//       }
//       if (this._highlight.node && this._highlight.node._inspector) {
//         scene.hover = this._highlight.node[symbol].id
//       }
//       if (window.$pixi) {
//         scene.selected = this.selection()
//         if (window.$pixi._inspector) {
//           scene.context = this.context(window.$pixi[symbol].id)
//         }
//       }
//       return scene
//     },

//     select (id) {
//       window.$pixi = this.find(id)
//       return this.selection()
//     },
//     selectAt (node, point) {
//       if (node === this._highlight.graphics) {
//         return false
//       }
//       if (node.containsPoint) {
//         if (node.containsPoint(point)) {
//           this.node(node)
//           window.$pixi = node
//           return node
//         }
//       } else if (node.children && node.children.length) {
//         for (var i = node.children.length - 1; i >= 0; i--) {
//           var result = this.selectAt(node.children[i], point)
//           if (result) {
//             this.node(node)
//             node[symbol].collapsed = false
//             return result
//           }
//         }
//       }
//       if (node.getBounds && node.getBounds().contains(point.x, point.y)) {
//         window.$pixi = node
//         return node
//       }
//     },
//     highlight (id) {
//       if (id === false) {
//         this._highlight.node = false
//         this._highlight.point = false
//       } else {
//         this._highlight.node = this.find(id)
//       }
//     },
//     highlightAt (node, point) {
//       if (node === this._highlight.graphics) {
//         return false
//       }
//       if (node.containsPoint) {
//         if (node.containsPoint(point)) {
//           return node
//         }
//       } else if (node.children && node.children.length) {
//         for (var i = node.children.length - 1; i >= 0; i--) {
//           var hit = this.highlightAt(node.children[i], point)
//           if (hit) {
//             return hit
//           }
//         }
//       }
//       if (node.getBounds && node.getBounds().contains(point.x, point.y)) {
//         return node
//       }
//       return false
//     },
//     selection () {
//       if (!window.$pixi) {
//         return null
//       }
//       var formatted = {
//         _inspector: window.$pixi._inspector
//       }

//       var properties = Object.keys(window.$pixi)

//       if (formatted._inspector !== undefined && formatted[symbol].whitelist !== undefined) {
//         properties = formatted[symbol].whitelist
//       }

//       properties.forEach(property => {
//         if (property[0] === '_' || ['children', 'parent', 'tempDisplayObjectParent'].indexOf(property) !== -1) {
//           return
//         }
//         var value = window.$pixi[property]
//         var type = typeof value
//         if (type === 'string' || type === 'number' || type === 'boolean' || value === null) {
//           formatted[property] = value
//         } else if (type === 'object') {
//           if (value.constructor === PIXI.Point) {
//             this.selectionPartial(formatted, property + '.', value)
//           } else if (value instanceof TransformBaseRef) {
//             this.selectionPartial(formatted, property + '.position.', value.position)
//             formatted[property + '.rotation'] = value.rotation
//             this.selectionPartial(formatted, property + '.skew.', value.skew)
//             this.selectionPartial(formatted, property + '.scale.', value.scale)
//           } else if (value instanceof ObservablePointRef) {
//             this.selectionPartial(formatted, property + '.', value)
//           } else {
//             formatted[property] = '...' + (typeof value.constructor ? value.constructor.name : type)
//           }
//         } else {
//           formatted[property] = '...' + type
//         }
//       })
//       return formatted
//     },
//     selectionPartial (formatted, path, object) {
//       if (object instanceof ObservablePointRef) {
//         formatted[path + 'x'] = object.x
//         formatted[path + 'y'] = object.y
//         return
//       }
//       Object.keys(object).forEach(function (property) {
//         if (property[0] === '_') {
//           return
//         }
//         var value = object[property]
//         var type = typeof value
//         if (type === 'string' || type === 'number' || type === 'boolean' || value === null) {
//           formatted[path + property] = value
//         } else {
//           formatted[path + property] = '...' + type
//         }
//       })
//     },
//     /**
// 		 * Get the surounding nodes (prev, next, parent. For tree keyboard navigation)
// 		 */
//     context (id, tree) {
//       tree = tree || this.tree()
//       var context = {}
//       if (tree.id === id) {
//         if (!tree.collapsed && !tree.leaf) {
//           context.next = tree.children[0].id
//         }
//         return context
//       }
//       if (!tree.collapsed && !tree.leaf) {
//         var found = false
//         var prev = tree
//         for (var i in tree.children) {
//           var node = tree.children[i]
//           if (found) {
//             context.next = node.id
//             return context
//           }
//           context = this.context(id, node)
//           if (context) {
//             if (!context.parent && tree.type !== 'root') {
//               context.parent = tree.id
//             }
//             if (!context.prev && prev.type !== 'root') {
//               context.prev = prev.id
//             }
//             if (context.next) {
//               return context
//             }
//             found = true
//             continue // collect context.next id
//           }
//           prev = node
//         }
//         if (found) {
//           return context
//         }
//       }
//       return false
//     },
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
