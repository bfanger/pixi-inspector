import { Observable } from 'rxjs/Observable'
import 'rxjs/add/operator/publish'
import 'rxjs/add/operator/first'
// import fromEvent from './fromEvent'
import connection$ from './connection$'

export default Observable.create(observer => {
  const connections = []
  const disconnectSubscriptions = []
  const connectSubscription = connection$.subscribe(connection => {
    connections.push(connection)
    observer.next(connections)
    disconnectSubscriptions.push(connection.disconnect$.subscribe(e => {
      connections.splice(connections.indexOf(connection), 1)
      observer.next(connections)
    }))
  })
  return () => {
    connectSubscription.unsubscribe()
    disconnectSubscriptions.forEach(subscription => subscription.unsubscribe())
  }
}).publish().refCount()
