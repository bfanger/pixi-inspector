import { overlay } from './InspectorGui'

export default class InspectorHighlight {
  constructor (inspector) {
    const graphics = new overlay.PIXI.Graphics()
    inspector.gui.stage.addChild(graphics)
    this.graphics = graphics
    if (this.graphics.transform) {
      this.defaultTransform = this.graphics.transform.worldTransform.clone()
    }
    // this.defaultMatrix = graphics.transform.local
    inspector.registerHook(this.update.bind(this))
  }

  update () {
    const box = this.graphics
    const node = InspectorHighlight.override || window.$pixi
    if (node) {
      box.visible = true
      box.clear()
      if (node.texture && node.transform) {
        box.lineStyle(1, 0xffaa40, 1)
        box.beginFill(0xff8500, 0.235)
        const width = node.texture.width
        const height = node.texture.height
        if (node.anchor) {
          box.drawRect(width * -1 * node.anchor.x, height * -1 * node.anchor.y, width, height)
        } else {
          box.drawRect(0, 0, width, height)
        }
        node.updateTransform()
        box.transform.setFromMatrix(node.transform.worldTransform)
      } else {
        box.lineStyle(1, 0xffaa40, 1)
        // box.beginFill(0x007eff, 0.05)
        var bounds = window.$pixi.getBounds()
        box.drawRect(bounds.x - 1, bounds.y - 1, bounds.width + 2, bounds.height + 2)
        if (box.transform) {
          box.transform.setFromMatrix(this.defaultTransform)
        }
      }
      box.endFill()
    } else {
      box.visible = false
    }
  }
}

InspectorHighlight.override = false
