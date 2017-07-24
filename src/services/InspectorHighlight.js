import { overlay } from './InspectorGui'

export default class InspectorHighlight {
  constructor (inspector) {
    this.gui = inspector.gui
    this.graphics = new overlay.PIXI.Graphics()
    inspector.gui.stage.addChild(this.graphics)
    // if (this.graphics.transform && this.graphics.transform.worldTransform) {
    //   this.defaultTransform = this.graphics.transform.worldTransform.clone()
    // }
    inspector.registerHook(this.update.bind(this))
  }

  update () {
    const box = this.graphics
    const node = InspectorHighlight.node
    if (node && node.parent) {
      box.visible = true
      box.clear()
      // if (node.texture && node.transform && node.transform.worldTransform) {
      //   box.lineStyle(1, 0xffaa40, 1)
      //   box.beginFill(0xff8500, 0.235)
      //   const width = node.texture.width
      //   const height = node.texture.height
      //   if (node.anchor) {
      //     box.drawRect(width * -1 * node.anchor.x, height * -1 * node.anchor.y, width, height)
      //   } else {
      //     box.drawRect(0, 0, width, height)
      //   }
      //   node.updateTransform()
      //   box.transform.setFromMatrix(node.transform.worldTransform)
      // } else {
      // if (this.defaultTransform) {
      //   box.transform.setFromMatrix(this.defaultTransform)
      // }
      // box.lineStyle(1, 0xffaa40, 1)
      // box.beginFill(0x007eff, 0.05)
      box.beginFill(0x007eff, 0.3)
      box.lineStyle(1, 0x007eff, 0.6)
      var bounds = node.getBounds()
      box.drawRect((bounds.x / this.gui.resolution.x), (bounds.y / this.gui.resolution.y), (bounds.width / this.gui.resolution.x), (bounds.height / this.gui.resolution.y))
      box.endFill()
    } else {
      box.visible = false
    }
  }
}

InspectorHighlight.node = false
