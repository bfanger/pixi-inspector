import { Subject } from 'rxjs/Subject'
import { Observable } from 'rxjs/Observable'
import fromEvent from './fromEvent'

export default class Connection {
  constructor (port) {
    const messageObserver = {
      next (message) {
        port.postMessage(message)
      }
    }
    const disconnectTrigger$ = new Subject()
    let isDisconnected = false
    const disconnectObserver = {
      next () {
        port.disconnect()
        disconnectTrigger$.next()
        isDisconnected = true
      }
    }
    const disconnect$ = Observable.merge(
      fromEvent(port.onDisconnect),
      disconnectTrigger$,
      Observable.defer(() => {
        if (isDisconnected) {
          return Observable.of(true)
        } else {
          return Observable.empty()
        }
      })
    ).first()
    const message$ = fromEvent(port.onMessage)
      .map(([message]) => message)
      .takeUntil(disconnect$)

    this.name = port.name
    this.message$ = Subject.create(messageObserver, message$)
    this.disconnect$ = Subject.create(disconnectObserver, disconnect$)
    this.sender = port.sender
  }

  postMessage (message) {
    this.message$.next(message)
  }

  disconnect () {
    this.disconnect$.next()
  }
}
