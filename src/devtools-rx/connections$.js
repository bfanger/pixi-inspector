import { Observable } from 'rxjs/Observable'
import connection$ from './connection$'

const connections$ = Observable.create(observer => {
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
}).publishReplay(1)

export const subscription = connections$.connect()

export default connections$
