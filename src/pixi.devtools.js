import './common'
import Connection from './devtools-rx/Connection'

const debug = false
debug && console.info('pixi.devtools')

/**
 * Access to the chrome.devtools apis
 */

const connection = new Connection({ name: 'devtools_page' })
let panelActive = false
connection.message$.subscribe(message => {
  debug && console.log('onMessage', message)
  if (message.command === 'PANEL_ACTIVE') {
    connection.postMessage({ response: 'PANEL_ACTIVE', data: panelActive, to: message.from, id: message.id })
    return
  }
  if (!panelActive) {
    if (message.command === 'DETECTED' || (message.response === 'INSTANCES' && message.data.length > 0)) {
      connection.postMessage({ command: 'LOG', to: 0, data: 'panels.create' })
      chrome.devtools.panels.create('Pixi', 'img/pixi.png', 'pixi.panel.html', function (panel) {
        panel.onShown.addListener(() => {
          panelActive = true
        })
        panel.onHidden.addListener(() => {
          panelActive = false
        })
      })
    }
  }
})

// When devtools in opened detect again, just in case.
connection.postMessage({ broadcast: 'DETECT', channel: 'content_scripts', tabId: chrome.devtools.inspectedWindow.tabId })
// When pixi was detected before
connection.postMessage({ broadcast: 'INSTANCES', channel: 'content_scripts', tabId: chrome.devtools.inspectedWindow.tabId })
