/**
 * Example game where PIXI is not exposed onto the window object.
 */

import { Application, Sprite, Texture, Rectangle } from 'pixi.js'

window.__PIXI_INSPECTOR_GLOBAL_HOOK__ && window.__PIXI_INSPECTOR_GLOBAL_HOOK__.register({ PIXI: window.PIXI })
delete window.PIXI

const app = new Application({
  view: document.getElementById('example')
})
class Crab extends Sprite {
  constructor () {
    super(Texture.fromImage('assets/seacreatures_json.png'))
    this.texture.frame = new Rectangle(0, 0, 100, 100)
  }
}
const crab = new Crab()
crab.position.set(350, 250)

app.stage.addChild(crab)
app.start()
