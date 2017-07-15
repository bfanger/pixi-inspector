import debug from './debug'

export default class Command {
  constructor (connection, message) {
    this.connection = connection
    this.data = message.data
    debug && console.log('client[' + message.from + '] ' + (message.id ? 'stream' : 'on') + ' "' + message.command + '" ', message.data)
    this.recipient = message.from
    this.id = message.id
  }

  respond (response, data) {
    debug && console.log('respond "' + response + '"', data)
    this.connection.postMessage({
      response: response,
      to: this.recipient,
      data: data,
      id: this.id
    })
  }
}
