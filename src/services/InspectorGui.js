import { Observable } from 'rxjs/Observable'
console.log(Observable.prototype)
export const overlay = {
  div: null,
  renderer: null,
  PIXI: null,
  subscription: null
}

export default class InspectorGui {
  constructor (inspector) {
    if (!overlay.PIXI) {
      overlay.PIXI = inspector.PIXI
    }
    const Stage = overlay.PIXI.Container || overlay.PIXI.DisplayObjectContainer
    this.stage = new Stage()

    inspector.registerHook(this.calculateOffset.bind(this), 5000)
    inspector.registerHook(this.render.bind(this))
  }

  activate () {
    if (overlay.subscription) {
      overlay.subscription.unsubscribe()
      overlay.subscription = null
    }

    if (overlay.div) {
      overlay.div.removeAttribute('style')
    } else {
      overlay.div = document.createElement('div')
      overlay.div.id = 'pixi-inspector-overlay'
      const style = document.createElement('style')
      style.textContent = `
      #pixi-inspector-overlay {
        position: fixed;
        z-index: 16000000;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        pointer-events: none;
        overflow: hidden;
      }
      #pixi-inspector-overlay canvas {
        position: absolute;
        top: 0;
        left: 0;
      }
      `
      overlay.div.appendChild(style)
      document.body.appendChild(overlay.div)

      const canvas = document.createElement('canvas')
      canvas.style.width = window.innerWidth + 'px'
      canvas.style.height = window.innerHeight + 'px'

      const options = {
        transparent: true,
        resolution: window.devicePixelRatio,
        view: canvas
      }
      if (overlay.PIXI.WebGLRenderer.length === 1) { // Expects a Phaser Game object?
        overlay.renderer = new overlay.PIXI.WebGLRenderer(Object.assign({
          canvas: canvas,
          camera: {
            _shake: { x: 0, y: 0 }
          },
          width: window.innerWidth,
          height: window.innerHeight
        }, options))
      } else {
        overlay.renderer = new overlay.PIXI.WebGLRenderer(window.innerWidth, window.innerHeight, options)
      }
      overlay.div.appendChild(canvas)
    }
    overlay.subscription = Observable.merge(
      Observable.fromEvent(window, 'resize').debounceTime(100).do(_ => {
        overlay.renderer.resize(window.innerWidth, window.innerHeight)
        overlay.renderer.view.style.width = window.innerWidth + 'px'
        overlay.renderer.view.style.height = window.innerHeight + 'px'
        this.calculateOffset()
      }),
      Observable.fromEvent(window, 'scroll').debounceTime(50).do(() => this.calculateOffset())
    ).subscribe()
  }

  deactivate () {
    overlay.div.style.display = 'none'
    if (overlay.subscription) {
      overlay.subscription.unsubscribe()
      overlay.subscription = null
    }
  }

  render () {
    if (overlay.renderer) {
      overlay.renderer.render(this.stage)
    }
  }

  calculateOffset (_, renderer) {
    if (renderer && renderer.view) {
      this.canvas = renderer.view
    }
    if (this.canvas.parentElement) {
      const bounds = this.canvas.getBoundingClientRect()
      this.stage.position.x = bounds.left
      this.stage.position.y = bounds.top
      for (const canvas of document.querySelectorAll('canvas')) {
        if (canvas === this.canvas) {
          return
        }
      }
      // Check for the canvas inside an iframe
      for (const iframe of document.querySelectorAll('iframe')) {
        try {
          for (const canvas of iframe.contentDocument.querySelectorAll('canvas')) {
            if (canvas === this.canvas) {
              const iframeBounds = iframe.getBoundingClientRect()
              this.stage.position.x += Math.floor(iframeBounds.left)
              this.stage.position.y += Math.floor(iframeBounds.top)
            }
          }
        } catch (err) {}
      }
    }
  }
}
