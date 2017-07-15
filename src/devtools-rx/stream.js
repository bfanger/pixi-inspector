import { Observable } from 'rxjs/Observable'

let autoIncrement = 1

export default function stream (connection, command, recipient, data) {
  return Observable.defer(() => {
    const id = autoIncrement
    autoIncrement++
    connection.send(command, recipient, data, { id })

    return connection.message$.filter(message => (message.id === id)).do(message => {
      if (message.response === 'ERROR') {
        throw new Error(message.data)
      }
    })
  })
}
