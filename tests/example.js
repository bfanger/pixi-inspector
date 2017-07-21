/**
 * Example game where PIXI is not exposed onto the window object.
 */

// import { Application, Sprite } from 'pixi.js'
import Application from 'pixi.js/lib/core/Application'
import Sprite from 'pixi.js/lib/core/sprites/Sprite'

window.__PIXI_INSPECTOR_GLOBAL_HOOK__ && window.__PIXI_INSPECTOR_GLOBAL_HOOK__.register({ PIXI: window.PIXI })
delete window.PIXI

const app = new Application({ view: document.getElementById('example') })
const crab = Sprite.fromImage('assets/seacreatures_json.png')
console.log(crab.texture.frame)
// crab.texture.frame = new Rectangle(0, 0, 0.5, 0.5)
app.stage.addChild(crab)
app.start()

