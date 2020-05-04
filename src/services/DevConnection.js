/* global PIXI */
/* eslint-disable no-console, class-methods-use-this */
import { Subject, of, never } from "rxjs";
import Inspector from "./Inspector";

const commands = {
  TREE: new Subject(),
  SELECTED: new Subject(),
};
let inspector = null;

if (!window.PIXI) {
  console.warn("DevConnection requires a global PIXI object");
}
function emit(command, data) {
  if (commands[command]) {
    return commands[command].next(
      JSON.parse(JSON.stringify({ command, data }))
    );
  }
  console.warn("Unsupported emit", command);
}

export class DevClient {
  send(command) {
    if (command === "DETECT") {
      return;
    }
    console.warn("Unsupported send", command);
  }
  stream(command) {
    if (command === "INSTANCES") {
      return of({
        data: [{ status: "INJECTED", version: PIXI.VERSION }],
      });
    }
    if (command === "PANEL_VISIBLE") {
      return of({ data: true });
    }
    console.warn("Unsupported stream", command);
    return never();
  }
  get(command) {
    if (command === "INSPECTOR") {
      if (!inspector) {
        inspector = new Inspector({ PIXI, Phaser: window.Phaser }, emit);
      }
      window.pixiInspector = inspector;
      return of(inspector);
    }
    throw new Error('Unsupported get "' + command + '"');
  }
  set(command) {
    throw new Error('Unsupported set "' + command + '"');
  }
}
export default class DevConnection {
  to() {
    return new DevClient();
  }
  on(command) {
    if (commands[command]) {
      return commands[command];
    }
    if (command === "DETECTED") {
      return never();
    }
    if (command === "DISCONNECTED") {
      return never();
    }
    console.warn("Unsupported connection.on", command);
    return never();
  }
}
