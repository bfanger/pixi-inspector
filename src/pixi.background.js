import './common'
import relay$ from './devtools-rx/relay$'
import connection$ from './devtools-rx/connection$'
import { debug } from './services/config'
const verbose = false

console.info('pixi.background')

relay$.subscribe()

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

