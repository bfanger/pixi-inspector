import connection from './connection'
import { Observable } from 'rxjs/Observable'

/**
 * @var {Observable} All frames which have detected one ore more PIXI instances.
 */
export default Observable.defer(() => {
  connection.to({ name: 'content_scripts' }).send('DETECT')
  const frames = []
  // @todo Detect when a frame was closed/reloaded.
  return connection.on('DETECTED').startWith(null).switchMap(() => {
    return connection.to({ name: 'content_scripts' }).stream('INSTANCES')
  }).switchMap(message => {
    const index = frames.findIndex(instance => instance.from === message.from)
    if (message.data.length === 0) {
      if (index === -1) {
        return Observable.empty()
      } else {
        frames.splice(index, 1)
        return Observable.of(frames)
      }
    }
    // chrome.devtools.inspectedWindow.eval('console.info(window.PIXI || "no pixi :(")', { frameURL: message.frameURL }, function (...args) {
    //   connection.log(...args)
    // })
    if (index === -1) {
      frames.push(message)
    } else {
      frames[index] = message
    }
    return Observable.of(frames)
  })
})
