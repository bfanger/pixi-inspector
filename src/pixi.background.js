import './common'
import connections$ from './devtools-rx/connections$'
import connection$ from './devtools-rx/connection$'

const debug = false
const verbose = true

console.info('pixi.background')

if (debug && verbose) {
  connection$.mergeMap(connection => {
    console.log('new Connection', { id: connection.id, name: connection.name, tabId: connection.tabId })
    return connection.message$
  }).subscribe(message => {
    console.log('new Message', message)
  })
}

// Listen to DETECTED messages and show the PageAction icon
connection$.mergeMap(connection => {
  const detected$ = connection.message$.filter(message => message.broadcast === 'DETECTED')
  return detected$.do(message => {
    const tabId = connection.tabId
    debug && console.log('DETECTED', { tabId, index: message.data.index, version: message.data.version })
    chrome.pageAction.show(tabId)
    if (message.data.phaser) {
      chrome.pageAction.setTitle({ tabId, title: 'Phaser ' + message.data.phaser + '( PixiJS ' + message.data.version + ' )' })
      chrome.pageAction.setIcon({ tabId, path: 'page_action-phaser.png' })
    } else {
      chrome.pageAction.setTitle({ tabId, title: 'PixiJS ' + message.data.version })
      chrome.pageAction.setIcon({ tabId, path: 'page_action.png' })
    }
  })
}).subscribe()

connection$.mergeMap(connection => connection.message$.withLatestFrom(connections$).do(([message, connections]) => {
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
      if (filter.tabId && (!target.sender.tab || target.sender.tab.id !== filter.tabId)) {
        return false // Only to connection inside a specific tab
      }
      return true
    })
    debug && console.log('broadcast "' + command.command + '" to ' + targets.length + ' clients')

    targets.forEach(target => target.postMessage(command))
  } else if (message.to === 0) {
    if (message.command === 'TAB_ID') {
      connection.tabId = message.data
    }
    if (message.command === 'LOG') {
      console.info('Connection[' + connection.id + ']', message.data)
    } else if (message.command) {
      debug && console.log('Connection[' + connection.id + ']', message)
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
    delete _message.to
    debug && console.log('Deliver message from ' + connection.id + ' to ' + target.id, _message)
    target.postMessage(_message)
  } else {
    console.warn('to: is required for', message, 'from', connection)
  }
})).subscribe()
