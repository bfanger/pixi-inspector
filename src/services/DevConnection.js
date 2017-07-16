/* global PIXI */
import { Observable } from 'rxjs/Observable'
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
    console.warn('Unsupported stream', command)
    return Observable.never()
  }
  get (command) {
    if (command === 'INSPECTOR') {
      return System.import('./Inspector').then(({ default: Inspector }) => {
        return new Inspector({ PIXI })
      })
    }
    return Promise.reject(new Error('Unsupported get "' + command + '"'))
  }
  set (command) {
    return Promise.reject(new Error('Unsupported set "' + command + '"'))
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
    console.warn('Unsupported connection.on', command)
    return Observable.never()
  }
}
