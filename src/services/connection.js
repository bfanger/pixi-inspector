import Connection from '../devtools-rx/Connection'

export const port = chrome.runtime.connect({
  name: 'pixi_panel'
})
const connection = new Connection(port)
connection.set('TAB_ID', 0, chrome.devtools.inspectedWindow.tabId)

export default connection
