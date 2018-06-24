import { take, takeUntil, map, filter } from "rxjs/operators";
import fromChromeEvent from "./fromChromeEvent";
import Command from "./Command";
import Client from "./Client";

export default class Connection {
  /**
   * @param {Port|string|object} options  Port, name or connection options
   */
  constructor(options) {
    if (typeof options === "string") {
      options = { name: options };
    }
    if (typeof options === "object" && options.postMessage) {
      // Port object
      this._port = options;
    } else {
      this._port = chrome.runtime.connect(options);
    }
    if (chrome.devtools && chrome.devtools.inspectedWindow) {
      this._port.postMessage({
        command: "TAB_ID",
        to: 0,
        data: chrome.devtools.inspectedWindow.tabId
      });
    }
  }

  get name() {
    return this._port.name;
  }

  get sender() {
    return this._port.sender;
  }

  get message$() {
    return fromChromeEvent(this._port.onMessage).pipe(
      takeUntil(this.disconnect$),
      map(([message]) => message)
    );
  }

  get disconnect$() {
    return fromChromeEvent(this._port.onDisconnect).pipe(take(1));
  }

  postMessage(message) {
    return this._port.postMessage(message);
  }

  disconnect() {
    return this._port.disconnect();
  }

  /**
   * Listen for a specific command.
   *
   * @param {string} command
   * @return {Observable}
   */
  on(command) {
    return this.message$.pipe(
      filter(message => message.command === command),
      map(message => new Command(this, message))
    );
  }

  /**
   * Specify the target and use the Client API to communicate.
   * @param {number|string|object} recipient A number (connection id) creates a 1 on 1 client, else a broadcast client is created.
   * @returns {Client}
   */
  to(recipient) {
    return new Client(this, recipient);
  }

  /**
   * Log a message in the pixi.background page.
   * @param {string|object} message
   */
  log(...args) {
    /* eslint-disable no-console */
    console.info(...args);
    /* eslint-enable */
    this.postMessage({
      command: "LOG",
      to: 0,
      data: args === 1 ? args[0] : args
    });
  }
}
