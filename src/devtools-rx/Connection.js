import fromEvent from './fromEvent'
import Command from './Command'
import Request from './Request'

const debug = false

export default class Connection {
  /**
   * @param {Port|Object} port  Port or connection options
   */
  constructor (port) {
    if (!port || !port.postMessage) {
      this._port = chrome.runtime.connect(port)
    } else {
      this._port = port
    }
    if (port.sender && port.sender.tab) {
      this.tabId = port.sender.tab.id
    }
  }

  get name () { return this._port.name }

  get sender () { return this._port.sender }

  get message$ () {
    return fromEvent(this._port.onMessage)
      .takeUntil(this.disconnect$)
      .map(([message]) => message)
  }

  get disconnect$ () {
    return fromEvent(this._port.onDisconnect)
  }

  postMessage (message) {
    return this._port.postMessage(message)
  }

  disconnect () {
    return this._port.disconnect()
  }

  /**
   * Listen to a specific command.
   *
   * @param {string} command
   * @return {Observable}
   */
  on (command) {
    return this.message$.filter(message => message.command === command).map(message => {
      return new Command(this, message)
    })
  }

  /**
   * Send a command to one or more connections.
   *
   * @param {string} command
   * @param {number|object} recipient
   * @param {*} data
   * @returns {Request}
   */
  send (command, recipient, data) {
    return new Request(this, command, recipient, data)
  }

  /**
   * Retrieve a value.
   * (Sends a command and expects a response with the same name.)
   *
   * @param {string} command
   * @param {number} recipient
   * @param {*} data
   * @returns {Promise}
   */
  get (command, recipient, data) {
    if (typeof recipient !== 'number') {
      throw new Error('Invalid recipient') // Prevent accidental race conditions
    }
    debug && console.log('get', { command, recipient, data })
    const request = new Request(this, command, recipient, data)
    return request.response$.take(1).map(response => {
      if (response.response !== command) {
        throw new Error('Unexpected response "' + response.response + '", expecting "' + command + '"')
      }
      return response.data
    }).toPromise()
  }

  /**
   * Similar to send() but doesn't create a Request object.
   *
   * @param {string} command
   * @param {number} recipient
   * @param {*} data
   */
  set (command, recipient, data) {
    if (typeof recipient !== 'number') {
      throw new Error('Invalid recipient') // Prevent accidental race conditions
    }
    debug && console.log('set', { command, recipient, data })
    this.postMessage({
      command: command,
      to: recipient,
      data: data
    })
  }

  /**
   * Log a message in the pixi.background page.
   * @param {string|object} message
   */
  log (...args) {
    console.info.apply(console, arguments)
    this.postMessage({ command: 'LOG', to: 0, data: args === 1 ? args[0] : args })
  }
}
