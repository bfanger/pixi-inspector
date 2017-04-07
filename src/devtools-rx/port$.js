/* global chrome */
import fromEvent from './fromEvent'

export default fromEvent(chrome.runtime.onConnect)
