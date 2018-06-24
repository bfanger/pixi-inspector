/* eslint-disable no-console */
import { throwError } from "rxjs";
import { filter, take, takeUntil, map } from "rxjs/operators";
import stream from "./stream";
import debug from "./debug";

export default class Client {
  /**
   * @param {*} connection
   * @param {number|object} recipient
   */
  constructor(connection, recipient) {
    this.isBroadcast = typeof recipient !== "number";
    if (typeof recipient === "string") {
      this.recipient = { name: recipient };
    } else {
      this.recipient = recipient;
    }
    this.connection = connection;
  }

  get disconnect$() {
    if (this.isBroadcast) {
      return throwError(
        new Error("disconnect$ is not available for broadcast clients")
      );
    }
    return this.connection.on("DISCONNECTED").pipe(
      filter(message => message.from === this.recipient),
      take(1)
    );
  }

  /**
   * Send a command to one or more connections.
   *
   * @param {string} command
   * @param {*} data
   * @returns {Observable}
   */
  send(command, data, options = {}) {
    const message = Object.assign({ data }, options);
    if (this.isBroadcast) {
      message.broadcast = command;
      message.filter = Object.assign(
        {
          tabId:
            this.recipient.tabId ||
            (chrome.devtools &&
              chrome.devtools.inspectedWindow &&
              chrome.devtools.inspectedWindow.tabId)
        },
        this.recipient
      );
    } else {
      message.command = command;
      message.to = this.recipient;
    }
    if (debug) {
      const logMessage = message.id
        ? 'stream "' + command + '" from'
        : 'send "' + command + '" to';
      if (typeof data === "undefined") {
        console.log(logMessage, this.recipient);
      } else {
        console.log(logMessage, this.recipient, data);
      }
    }
    this.connection.postMessage(message);
  }

  /**
   * Send a command and stream the replys
   *
   * @param {string} command
   * @param {*} data
   * @returns {Observable}
   */
  stream(command, data) {
    const message$ = stream(this, command, data);
    if (this.isBroadcast) {
      return message$;
    }
    return message$.pipe(takeUntil(this.disconnect$));
  }

  /**
   * Retrieve a value.
   * (Sends a command and expects a response with the same name.)
   *
   * @param {string} command
   * @param {*} data
   * @returns {Observable}
   */
  get(command, data) {
    if (this.isBroadcast) {
      throw new Error("Invalid recipient"); // Prevent accidental race conditions
    }
    if (debug) {
      if (arguments.length === 1) {
        console.log("client[" + this.recipient + '] get "' + command + '"');
      } else {
        console.log(
          "client[" + this.recipient + '] get "' + command + '"(',
          data,
          ")"
        );
      }
    }
    const message$ = stream(this, command, data);
    return message$.pipe(
      take(1),
      map(message => {
        if (message.response !== command) {
          throw new Error(
            'Unexpected response "' +
              message.response +
              '", expecting "' +
              command +
              '"'
          );
        }
        return message.data;
      })
    );
  }

  /**
   * Similar to send() but doesn't create a Request object.
   *
   * @param {string} command
   * @param {*} data
   */
  set(command, data) {
    if (this.isBroadcast) {
      throw new Error("Invalid recipient"); // Prevent accidental race conditions
    }
    debug &&
      console.log(
        "client[" + this.recipient + '] set "' + command + '" = ',
        data
      );
    this.connection.postMessage({
      command,
      to: this.recipient,
      data
    });
  }
}
