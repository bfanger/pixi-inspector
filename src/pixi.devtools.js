import './common'
import Connection from './devtools-rx/Connection'

/**
 * Access to the chrome.devtools apis
 */
console.info('pixi.devtools')

const connection = new Connection({
  name: 'devtools_page'
})
connection.message$.subscribe(message => {
  console.info('onMessage', message)
  if (message.response === 'DETECTED') {
    connection.postMessage({ command: 'LOG', to: 0, data: 'panels.create' })
    chrome.devtools.panels.create('Pixi', 'img/pixi.png', 'pixi.panel.html', function (panel) {
      // listen to panel hide / show events?
      panel.onShown.addListener(() => {
        console.log('PixiPanel: visible')
        connection.postMessage({ command: 'LOG', to: 0, data: 'panels.onShown' })
      })
      panel.onHidden.addListener(() => {
        console.log('PixiPanel: hidden')
        connection.postMessage({ command: 'LOG', to: 0, data: 'panels.onHidden' })
      })
    })
  }
})
connection.postMessage({ broadcast: 'DETECT', channel: 'content_scripts', tabId: chrome.devtools.inspectedWindow.tabId })
