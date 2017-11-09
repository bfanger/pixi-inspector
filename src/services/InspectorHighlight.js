import { overlay } from "./InspectorGui";

export default class InspectorHighlight {
  constructor(inspector) {
    this.gui = inspector.gui;
    this.graphics = new overlay.PIXI.Graphics();
    inspector.gui.container.addChild(this.graphics);
    // if (this.graphics.transform && this.graphics.transform.worldTransform) {
    //   this.defaultTransform = this.graphics.transform.worldTransform.clone()
    // }
    inspector.registerHook("afterRender", this.update.bind(this));
  }

  update(_, renderer) {
    const box = this.graphics;
    const node = InspectorHighlight.node;
    if (node && node.parent) {
      box.visible = true;
      box.clear();
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
      box.beginFill(0x007eff, 0.3);
      box.lineStyle(1, 0x007eff, 0.6);
      const bounds = node.getBounds();
      const scale = {
        x: this.gui.resolution.x / renderer.resolution,
        y: this.gui.resolution.y / renderer.resolution
      };
      box.drawRect(
        bounds.x * scale.x,
        bounds.y * scale.y,
        bounds.width * scale.x,
        bounds.height * scale.y
      );
      
      const offDisplay =
          bounds.x + bounds.width < 0
        || bounds.y + bounds.height < 0
        || renderer.width / renderer.resolution < bounds.x * scale.x
        || renderer.height / renderer.resolution < bounds.y * scale.y;
        
      box.lineStyle(2, offDisplay ? 0xff0000 : 0x007eff, 0.3)
        .moveTo(
          renderer.width / renderer.resolution / 2 , 
          renderer.height / renderer.resolution / 2
        )
        .lineTo(
          bounds.x * scale.x + bounds.width * scale.x / 2, 
          bounds.y * scale.y + bounds.height * scale.y / 2
        );
      box.endFill();
    } else {
      box.visible = false;
    }
  }
}

InspectorHighlight.node = false;
