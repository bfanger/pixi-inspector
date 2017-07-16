import { Observable } from 'rxjs/Observable'

let autoIncrement = 1

export default function stream (client, command, data) {
  return Observable.defer(() => {
    const id = autoIncrement
    autoIncrement++
    client.send(command, data, { id })

    return client.connection.message$.filter(message => (message.id === id)).do(message => {
      if (message.response === 'ERROR') {
        throw new Error(message.data)
      }
    })
  })
}
