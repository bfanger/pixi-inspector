const debug = false
let autoIncrement = 1

export default class Request {
  constructor (connection, command, recipient, data) {
    this.id = autoIncrement
    autoIncrement++

    if (typeof recipient === 'number') {
      debug && console.log('send command', { command, recipient, data })
      connection.postMessage({
        command: command,
        to: recipient,
        data: data,
        id: this.id
      })
    } else {
      debug && console.log('send broadcast', { command, recipient, data })
      const filter = Object.assign({
        tabId: chrome.devtools && chrome.devtools.inspectedWindow && chrome.devtools.inspectedWindow.tabId
      }, recipient)
      connection.postMessage({
        broadcast: command,
        filter: filter,
        data: data,
        id: this.id
      })
    }
    this.response$ = connection.message$.filter(message => (message.id === this.id && message.response)).do(message => {
      if (message.response === 'ERROR') {
        throw new Error(message.data)
      }
    })
  }
}
