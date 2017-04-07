/* global chrome */
import { Subject } from 'rxjs/Subject'
import { Observable } from 'rxjs/Observable'
import fromEvent from './fromEvent'
import 'rxjs/add/observable/defer'
import 'rxjs/add/observable/merge'
import 'rxjs/add/observable/empty'
import 'rxjs/add/observable/of'
import 'rxjs/add/operator/map'
import 'rxjs/add/operator/takeUntil'

export default fromEvent(chrome.runtime.onConnect).map(port => {
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

  return {
    name: port.name,
    message$: Subject.create(messageObserver, message$),
    disconnect$: Subject.create(disconnectObserver, disconnect$),
    sender: port.sender,
    postMessage (message) {
      this.message$.next(message)
    },
    disconnect () {
      this.disconnect$.next()
    }
  }
})
