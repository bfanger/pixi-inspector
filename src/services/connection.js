
let connection
if (process.env.DEV_SERVER) {
  const DevConnection = require('./DevConnection').default
  connection = new DevConnection()
} else {
  const Connection = require('../devtools-rx/Connection').default
  const port = chrome.runtime.connect({ name: 'pixi_panel' })
  connection = new Connection(port)
  connection.to(0).set('TAB_ID', chrome.devtools.inspectedWindow.tabId)
}

export default connection
