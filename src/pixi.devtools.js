import './common'
import Connection from './devtools-rx/Connection'
import { debug } from './services/config'

debug && console.info('pixi.devtools')

/**
 * Access to the chrome.devtools apis
 */
let panelActive = false
function activatePanel () {
  if (panelActive) {
    return
  }
  debug && connection.log('activatePanel')
  chrome.devtools.panels.create('Pixi', 'img/pixi.png', 'pixi.panel.html', function (panel) {
    panel.onShown.addListener(() => {
      connection.to({ name: 'content_scripts' }).send('DETECT')
      panelActive = true
    })
    panel.onHidden.addListener(() => {
      panelActive = false
    })
  })
}
const connection = new Connection({ name: 'devtools_page' })
connection.to(0).set('TAB_ID', chrome.devtools.inspectedWindow.tabId)
connection.on('PANEL_ACTIVE').subscribe(command => {
  command.respond('PANEL_ACTIVE', panelActive)
})
connection.on('DETECTED').subscribe(() => {
  activatePanel()
})
// When devtools is opened, start detection again, just in case.
// If all pixi instances are already detected, no DETECTED events will fire.
connection.to({ name: 'content_scripts' }).send('DETECT')
// Retrieve the detected instances
connection.to({ name: 'content_scripts' }).stream('INSTANCES').subscribe(message => {
  if (message.data.length > 0) {
    activatePanel()
  }
})
