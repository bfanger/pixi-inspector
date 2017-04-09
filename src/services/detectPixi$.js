
import Connection from '../devtools-rx/Connection'
import { Observable } from 'rxjs/Observable'

let detectPixi$
if (chrome.extension) {
  const port = chrome.runtime.connect({
    name: 'pixi_panel'
  })
  const connection = new Connection(port)
  connection.postMessage({
    command: 'INIT',
    tabId: chrome.devtools.inspectedWindow.tabId
  })
  detectPixi$ = connection.message$.publishReplay(1)
  detectPixi$.connect()
} else {
  detectPixi$ = Observable.of({ path: 'PIXI' })
}
export default detectPixi$.do(m => console.log(m))

// import { Observable } from 'rxjs/Observable'
// import proxy from './proxy'

// let detectTimeout = 500
// const debug = false

// /**
//  * @var {Observable}
//  * Looks for PIXI in the inspected page and emit the path (Ex. 'window.PIXI') when found.
//  * Keeps checking when PIXI is not detected, but polling for PIXI slows down.
//  */
// export default Observable.defer(function () {
//   debug && console.log('detectPixi$: Looking for PIXI')
//   return proxy.evalFn(function () {
//     var detect = function detect (window) {
//       if (window.PIXI) { // global variable
//         return 'PIXI'
//       } else if (window.game && window.game.PIXI) { // inside panda.js
//         return 'game.PIXI'
//       } else if (window.Phaser && window.Phaser.PIXI) { // inside Phaser
//         return 'Phaser.PIXI'
//       }
//     }
//     var detected = detect(window)
//     if (detected) {
//       return 'window.' + detected
//     }
//     for (var i = 0; i < window.frames.length; i++) {
//       detected = detect(window.frames[i])
//       if (detected) {
//         return 'window.frames[' + i + '].' + detected
//       }
//     }
//     return false
//   }).then(function (path) {
//     if (path === false) {
//       throw new Error('Unable to detect PIXI')
//     }
//     debug && console.log('detectPixi$: PIXI found as "' + path + '"')
//     return path
//   })
// }).retryWhen(function (errors) {
//   return errors.delayWhen(() => {
//     if (detectTimeout < 5000) {
//       detectTimeout += 250 // increase retry interval
//     }
//     debug && console.log('detectPixi$: PIXI not found, retring in ' + detectTimeout + 'ms')
//     return Observable.timer(detectTimeout)
//   })
// })
