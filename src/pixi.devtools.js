import './common'
import Connection from './devtools-rx/Connection'

/**
 * Access to the chrome.devtools apis
 */
console.info('pixi.devtools')

const port = chrome.runtime.connect({
  name: 'devtools_page'
})
const connection = new Connection(port)
connection.postMessage({
  command: 'INIT',
  tabId: chrome.devtools.inspectedWindow.tabId
})
connection.message$.subscribe(message => {
  console.info('onMessage', message)
  if (message.command === 'DETECTED') {
    chrome.devtools.panels.create('Pixi', 'img/pixi.png', 'pixi.panel.html', function (panel) {
      // listen to panel hide / show events?
      panel.onShown.addListener(() => {
        console.log('PixiPanel: visible')
      })
      panel.onHidden.addListener(() => {
        console.log('PixiPanel: hidden')
      })
    })
  }
})
