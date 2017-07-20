import Proxy from './Proxy'
import connection from './connection'
import { Observable } from 'rxjs/Observable'
import instances$ from './instances$'

/**
 * Select in the last frame (with pixi) the last detected pixi instance.
 */
export const latestInstance$ = instances$.map(frames => {
  if (frames.length === 0) {
    return null
  }
  const frame = frames[frames.length - 1]
  if (frame.data.length === 0) {
    return null
  }
  const instance = frame.data[frame.data.length - 1]
  return {
    version: instance.version,
    status: instance.status,
    connection: frame.from,
    frameURL: frame.frameURL,
    index: (frame.data.length - 1)
  }
})
/**
 * Create a Proxy for the detected instance
 */
const latestInspector$ = latestInstance$.switchMap(instance => {
  if (instance === null) {
    return Observable.of(null)
  }
  return connection.to(instance.connection).get('INSPECTOR', instance.index)
    .switchMap(index => {
      return Observable.create(observer => {
        const proxy = new Proxy(index, { frameURL: instance.frameURL })
        observer.next(proxy)
        proxy.activate()
        return () => {
          proxy.deactivate()
        }
      })
    })
}).startWith(null).publishReplay(1).refCount()

latestInspector$.method = function (method) {
  return this.map(inspector => {
    return function () {
      if (inspector == null) {
        console.log('No inspector available')
        return
      }
      return inspector[method].apply(inspector, arguments)
    }
  })
}

export default latestInspector$
