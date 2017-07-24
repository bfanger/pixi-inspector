/* global PIXI */
import { Observable } from 'rxjs/Observable'
import { Subject } from 'rxjs/Subject'
import Inspector from './Inspector'

const commands = {
  'TREE': new Subject(),
  'SELECTED': new Subject()
}
let inspector = null

if (!window.PIXI) {
  console.warn('DevConnection requires a global PIXI object')
}
function emit (command, data) {
  if (commands[command]) {
    return commands[command].next(JSON.parse(JSON.stringify({ command, data })))
  }
  console.warn('Unsupported emit', command)
}

export class DevClient {
  send (command, recipient, data) {
    if (command === 'DETECT') {
      return
    }
    console.warn('Unsupported send', command)
  }
  stream (command) {
    if (command === 'INSTANCES') {
      return Observable.of({ data: [{ status: 'INJECTED', version: PIXI.VERSION }] })
    }
    if (command === 'PANEL_VISIBLE') {
      return Observable.of({ data: true })
    }
    console.warn('Unsupported stream', command)
    return Observable.never()
  }
  get (command) {
    if (command === 'INSPECTOR') {
      if (!inspector) {
        inspector = new Inspector({ PIXI, Phaser: window.Phaser }, emit)
      }
      window.pixiInspector = inspector
      return Observable.of(inspector)
    }
    new Error('Unsupported get "' + command + '"')
  }
  set (command) {
    new Error('Unsupported set "' + command + '"')
  }
}
export default class DevConnection {
  to () {
    return new DevClient()
  }
  on (command) {
    if (commands[command]) {
      return commands[command]
    }
    if (command === 'DETECTED') {
      return Observable.never()
    }
    if (command === 'DISCONNECTED') {
      return Observable.never()
    }
    console.warn('Unsupported connection.on', command)
    return Observable.never()
  }
}
