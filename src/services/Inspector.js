import TypeDetection from './TypeDetection'
import Outliner from './InspectorOutliner'
import Properties from './InspectorProperties'
import Gui from './InspectorGui'
import Highlight from './InspectorHighlight'

let runningHooks = false

export default class Inspector {
  constructor (instance, emit) {
    this.PIXI = instance.PIXI
    this.emit = emit
    this.unpatched = {}

    this.typeDetection = new TypeDetection()
    this.typeDetection.registerTypes('', instance.PIXI, 2)
    instance.Phaser && this.typeDetection.registerTypes('Phaser.', instance.Phaser)
    this.hooks = []
    this.gui = new Gui(this)
    this.outliner = new Outliner(this)
    this.properties = new Properties(this)
    this.highlight = new Highlight(this)
  }

  activate () {
    if (!this.unpatched['CanvasRenderer']) {
      this.patch('CanvasRenderer')
    }
    if (!this.unpatched['WebGLRenderer']) {
      this.patch('WebGLRenderer')
    }
    this.gui.activate()
  }

  deactivate () {
    for (const [renderer, renderMethod] of Object.entries(this.unpatched)) {
      this.PIXI[renderer].prototype.render = renderMethod
    }
    this.unpatched = {}
    this.gui.deactivate()
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
        if (!runningHooks) {
          runningHooks = true
          for (const hook of self.hooks) {
            if (hook.skip) {
              continue
            }
            hook.callback(container, this)
            if (hook.throttle) {
              hook.skip = true
              setTimeout(() => {
                hook.skip = false
              }, hook.throttle)
            }
          }
          runningHooks = false
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
