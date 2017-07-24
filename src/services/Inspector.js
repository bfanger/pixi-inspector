import { ReplaySubject } from 'rxjs/ReplaySubject'
import TypeDetection from './TypeDetection'
import Outliner from './InspectorOutliner'
import Properties from './InspectorProperties'
import Gui from './InspectorGui'
import Highlight from './InspectorHighlight'

let runningHooks = false

export default class Inspector {
  constructor (instance, emit) {
    this.instance = instance
    this.emit = emit
    this.unpatched = {}
    this.hooks = []
    this.enabled$ = new ReplaySubject(1)

    // Register types
    this.typeDetection = new TypeDetection()
    const console = window.console
    window.console = { warn: () => {} } // Prevent lots of "Deprecation Warning: PIXI.${oldthing} has been deprecated, please use PIXI.${newthing}"
    this.typeDetection.registerTypes('PIXI.', instance.PIXI, 2)
    instance.Phaser && this.typeDetection.registerTypes('Phaser.', instance.Phaser)
    window.console = console

    // Register "plugins"
    this.gui = new Gui(this)
    this.outliner = new Outliner(this)
    this.properties = new Properties(this)
    this.highlight = new Highlight(this)
  }

  enable () {
    if (!this.unpatched['CanvasRenderer']) {
      this.patch('CanvasRenderer')
    }
    if (!this.unpatched['WebGLRenderer']) {
      this.patch('WebGLRenderer')
    }
    this.enabled$.next(true)
  }

  disable () {
    for (const [renderer, renderMethod] of Object.entries(this.unpatched)) {
      this.instance.PIXI[renderer].prototype.render = renderMethod
    }
    this.unpatched = {}
    this.enabled$.next(false)
  }

  /**
   * Path the Renderer.render method to get a hold of the stage object(s)
   */
  patch (renderer) {
    if (this.unpatched[renderer]) {
      console.warn(renderer + ' already patched')
      return
    }
    const Renderer = this.instance.PIXI[renderer]
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
