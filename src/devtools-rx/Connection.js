import fromEvent from './fromEvent'
import Command from './Command'
import stream from './stream'
import debug from './debug'

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
   * Listen for a specific command.
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
   * @returns {Observable}
   */
  send (command, recipient, data, options = {}) {
    const message = Object.assign({ data }, options)
    if (typeof recipient === 'number') {
      message.command = command
      message.to = recipient
    } else {
      message.broadcast = command
      message.filter = Object.assign({
        tabId: recipient.tabId || chrome.devtools && chrome.devtools.inspectedWindow && chrome.devtools.inspectedWindow.tabId
      }, recipient)
    }
    if (debug) {
      const logMessage = (message.id ? 'stream "' + command + '" from' : 'send "' + command + '" to')
      if (typeof data === 'undefined') {
        console.log(logMessage, recipient)
      } else {
        console.log(logMessage, recipient, data)
      }
    }
    this.postMessage(message)
  }

  /**
   * Send a command and stream the replys
   *
   * @param {string} command
   * @param {number|object} recipient
   * @param {*} data
   * @returns {Observable}
   */
  stream (command, recipient, data) {
    return stream(this, command, recipient, data)
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
    if (debug) {
      if (arguments.length === 2) {
        console.log('client[' + recipient + '] get "' + command + '"')
      } else {
        console.log('client[' + recipient + '] get "' + command + '"(', data, ')')
      }
    }
    const message$ = stream(this, command, recipient, data)
    return message$.take(1).map(message => {
      if (message.response !== command) {
        throw new Error('Unexpected response "' + message.response + '", expecting "' + command + '"')
      }
      return message.data
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
    debug && console.log('client[' + recipient + '] set "' + command + '" = ', data)
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
