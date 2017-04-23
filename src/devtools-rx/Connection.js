// import { Subject } from 'rxjs/Subject'
// import { Observable } from 'rxjs/Observable'
import fromEvent from './fromEvent'

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
}
