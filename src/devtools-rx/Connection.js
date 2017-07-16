import fromEvent from './fromEvent'
import Command from './Command'
import Client from './Client'

export default class Connection {
  /**
   * @param {Port|string|object} options  Port, name or connection options
   */
  constructor (options) {
    if (typeof options === 'string') {
      options = { name: options }
    }
    if (typeof options === 'object' && options.postMessage) { // Port object
      this._port = options
    } else {
      this._port = chrome.runtime.connect(options)
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
    return fromEvent(this._port.onDisconnect).take(1)
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
   * Specify the target and use the Client API to communicate.
   * @param {number|string|object} recipient A number (connection id) creates a 1 on 1 client, else a broadcast client is created.
   * @returns {Client}
   */
  to (recipient) {
    return new Client(this, recipient)
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
