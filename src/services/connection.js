import Connection from '../devtools-rx/Connection'

export const port = chrome.runtime.connect({
  name: 'pixi_panel'
})
const connection = new Connection(port)
connection.postMessage({
  command: 'INIT',
  tabId: chrome.devtools.inspectedWindow.tabId
})

export default connection
