/* global PIXI */
import { Observable } from 'rxjs/Observable'
import { Subject } from 'rxjs/Subject'
import Inspector from './Inspector'

const tree$ = new Subject()

function emit (command, data) {
  if (command === 'TREE') {
    return tree$.next(JSON.parse(JSON.stringify({ command, data })))
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
      return Observable.of(new Inspector({ PIXI }, emit))
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
    if (command === 'DETECTED') {
      return Observable.of({ version: PIXI.VERSION })
    }
    if (command === 'TREE') {
      return tree$
    }
    console.warn('Unsupported connection.on', command)
    return Observable.never()
  }
}
