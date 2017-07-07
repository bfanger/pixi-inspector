import { Observable } from 'rxjs/Observable'
// import Connection from '../devtools-rx/Connection'
/**
 * detectPixi$
 *
 * In chrome-extension mode:
 *   Setup a connection to background_script, broadcast DETECT command.
 *   collect the detected pixi's within x ms.
 *   emit an error if no pixi's where found.
 *   emit proxys + completed with detected pixi's
 *
 * In test/webpack-dev-server mode:
 *   Detect PIXI on the window object.
 *   emit proxys & complete
 */

// const timeout = 500
let detectPixi$
if (chrome.extension) {
  detectPixi$ = Observable.race(
    // Observable.timeout(timeout),
    Observable.defer(() => {
      // const connection = new Connection({ name: 'detect_pixi' })
      const paths = []
      return Observable.timer(150).map(() => paths)
    })
  )
  // connection.postMessage({
  //   command: 'INIT',
  //   tabId: chrome.devtools.inspectedWindow.tabId
  // })
  // detectPixi$ = connection.message$.filter(message => message.command === 'DETECTED').publishReplay(1)
  // detectPixi$.connect()
} else {
  detectPixi$ = Observable.of({ path: 'PIXI' })
}
export default detectPixi$.do(proxies => console.log(proxies))
