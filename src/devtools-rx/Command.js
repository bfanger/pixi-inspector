const debug = false

export default class Command {
  constructor (connection, message) {
    this.connection = connection
    this.data = message.data
    debug && console.log('new command from', connection.id, message)
    this.recipient = message.from
    this.id = message.id
  }

  respond (response, data) {
    debug && console.log('respond', { response, data })
    this.connection.postMessage({
      response: response,
      to: this.recipient,
      data: data,
      id: this.id
    })
  }
}
