/* eslint-disable no-console */
import debug from "./debug";

export default class Command {
  constructor(connection, message) {
    this.connection = connection;
    this.data = message.data;
    this.from = message.from;
    debug &&
      console.log(
        `client[${message.from}] ${message.id ? "stream" : "on"} "${
          message.command
        }" `,
        message.data
      );
    this.id = message.id;
  }

  respond(response, data) {
    debug && console.log(`respond "${response}" `, data);
    this.connection.postMessage({
      response,
      to: this.from,
      data,
      id: this.id
    });
  }
}
