import connection from './connection'
import { Observable } from 'rxjs/Observable'
/**
 * An array with connections with instances.
 */
export default Observable.defer(() => {
  connection.send('DETECT', { name: 'content_scripts' })
  const instances = []
  return connection.on('DETECTED').startWith(null).switchMap(() => {
    return connection.send('INSTANCES', { name: 'content_scripts' }).response$
  }).switchMap(message => {
    const index = instances.findIndex(instance => instance.from === message.from)
    if (message.data.length === 0) {
      if (index === -1) {
        return Observable.empty()
      } else {
        instances.splice(index, 1)
        return Observable.of(instances)
      }
    }
    // chrome.devtools.inspectedWindow.eval('console.info(window.PIXI || "no pixi :(")', { frameURL: message.frameURL }, function (...args) {
    //   connection.log(...args)
    // })
    const instance = {
      from: message.from,
      frameURL: message.frameURL,
      latest: message.data[message.data.length - 1],
      count: message.data.length
    }
    if (index === -1) {
      instances.push(instance)
    } else {
      instances[index] = instance
    }
    return Observable.of(instances)
  })
})
