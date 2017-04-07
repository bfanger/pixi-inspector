/* global chrome */
import { Observable } from 'rxjs/Observable'
import fromEvent from './fromEvent'
import 'rxjs/add/observable/merge'
import 'rxjs/add/observable/of'
import 'rxjs/add/operator/switchMap'

export default Observable.merge(
    Observable.of(null),
    fromEvent(chrome.tabs.onHighlighted),
    fromEvent(chrome.tabs.onRemoved)
).switchMap(() => {
  return new Promise(resolve => {
    chrome.tabs.query({ highlighted: true }, resolve)
  })
})
