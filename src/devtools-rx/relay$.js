import connection$ from './connection$'
import connections$ from './connections$'
import debug from './debug'

export default connection$.mergeMap(connection => connection.message$.withLatestFrom(connections$).do(([message, connections]) => {
  if (message.broadcast) {
    const command = {
      command: message.broadcast,
      from: connection.id,
      id: message.id,
      data: message.data
    }
    const filter = message.filter
    if (!filter.tabId) {
      filter.tabId = connection.tabId
    }
    const targets = Object.values(connections).filter(target => {
      if (target.id === connection.id) {
        return false // Don't broadcast back to sender
      }
      if (filter.name && target.name !== filter.name) {
        return false // Only to connection with a specific name
      }
      if (filter.names && filter.names.indexOf(target.name) === -1) {
        return false // Only to connection with a specific name
      }
      if (filter.tabId && (!target.tabId || target.tabId !== filter.tabId)) {
        return false // Only to connection inside a specific tab
      }
      return true
    })
    debug && console.log('client[' + connection.name + ' ' + connection.id + '] broadcast "' + command.command + '" to ' + targets.length + ' clients')

    targets.forEach(target => target.postMessage(command))
  } else if (message.to === 0) {
    if (message.command === 'TAB_ID') {
      connection.tabId = message.data
    } else if (message.command === 'LOG') {
      const prefix = 'Log [' + connection.name + ' ' + connection.id + ']'
      if (Array.isArray(message.data)) {
        console.info(prefix, ...message.data)
      } else {
        console.info('Log [' + connection.name + ' ' + connection.id + ']', message.data)
      }
    } else {
      debug && console.warn('Connection[' + connection.name + ' ' + connection.id + ']', message)
    }
  } else if (message.to) {
    const target = connections[message.to]
    if (!target) {
      debug && console.log('Couldn\'t deliver message', message, connections)
      connection.postMessage({
        response: 'ERROR',
        data: 'DISCONNECTED',
        id: message.id
      })
      return
    }
    const _message = Object.assign({}, message)
    _message.from = connection.id
    if (connection.sender.frameId !== 0) {
      _message.frameURL = connection.sender.url
    }
    delete _message.to
    debug && console.log('Deliver message from ' + connection.id + ' to ' + target.id, _message)
    target.postMessage(_message)
  } else {
    console.warn('to: is required for', message, 'from', connection)
  }
}))
