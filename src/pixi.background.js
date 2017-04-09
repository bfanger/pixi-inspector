import './common'
import connections$ from './devtools-rx/connections$'
import connection$ from './devtools-rx/connection$'
// import highlightedTabs$ from './devtools-rx/highlightedTabs$'
import { Observable } from 'rxjs/Observable'

console.info('pixi.background')

// // RAW
// chrome.runtime.onMessage.addListener(function () {
//   console.log('onMessage', arguments)
// })
// chrome.runtime.onConnect.addListener(function (port) {
//   console.log('onConnect', arguments)
//   port.onMessage.addListener(function () {
//     console.log('port.onMessage', arguments)
//   })
// })
// console.log('listening for connect()')

const contentConnection$ = connection$.filter(connection => connection.name === 'content_scripts').do(connection => {
  connection.tabId = connection.sender.tab.id
})
/**
 * For devtools_page and pixi_panle connection the tabId of the inspectedWindow is unknown
 * Wait for the INIT message which contains the tabId
 * @param {Connection} connection
 * @return {Observable}
 */
function connectionWithTabId (connection) {
  return connection.message$.first().switchMap((message) => {
    if (message.command !== 'INIT') {
      console.warn('Unexpected command', message)
      return Observable.empty()
    } else if (message.tabId === null) {
      return Observable.empty()
    }
    connection.tabId = message.tabId
    return Observable.of(connection)
  })
}

const devtoolsConnection$ = connection$.filter(connection => connection.name === 'devtools_page').switchMap(connectionWithTabId)
const panelConnection$ = connection$.filter(connection => connection.name === 'pixi_panel').switchMap(connectionWithTabId)

const contentMessages$ = contentConnection$.mergeMap(connection => {
  return connection.message$.map(message => ({ connection, message }))
}).publish().refCount()

contentMessages$.subscribe(({ message, connection }) => {
  const tabId = connection.sender.tab.id
  chrome.pageAction.show(tabId)
  chrome.pageAction.setTitle({ tabId, title: 'PixiJS ' + message.version })
})

devtoolsConnection$.withLatestFrom(connections$).mergeMap(([devtoolsConnection, connections]) => {
  // Send RETRY command to all content_scripts with same tabId and wait for DETECTED message
  const contentConnections = connections.filter(connection => connection.name === 'content_scripts' && connection.sender.tab.id === devtoolsConnection.tabId)
  if (contentConnections.length === 0) {
    console.log('No content_scripts for', devtoolsConnection.tabId)
    return Observable.empty()
  }
  contentConnections.forEach(contentConnections => {
    contentConnections.postMessage({ command: 'RETRY' })
  })
  return Observable.merge(...contentConnections.map(contentConnection => {
    contentConnection.tabId = contentConnection.sender.tab.id
    return contentConnection.message$.first().switchMap(config => {
      if (config.command !== 'DETECTED') {
        console.warn('Unexpected command', config)
        return Observable.empty()
      }
      return Observable.of({ config, contentConnection, devtoolsConnection })
    })
  }))
}).mergeMap(({ config, contentConnection, devtoolsConnection }) => {
  // Send the detected configuration(s) to the devtools_page and wait for the Panel(s) to connect
  devtoolsConnection.postMessage(config)
  return panelConnection$
    .filter(panelConnection => panelConnection.tabId === contentConnection.tabId)
    .mergeMap(panelConnection => {
      contentConnection.postMessage({ command: 'RETRY' })
      return Observable.create(observer => {
        const panel2contentSubscription = panelConnection.message$.do(message => {
          observer.next({ tabId: contentConnection.tabId, from: 'panel', to: 'content', message: message })
        }).subscribe(contentConnection.message$)
        const content2panelSubscription = contentConnection.message$.do(message => {
          if (message.command === 'DETECTED') {
            if (contentConnection.sender.url !== contentConnection.sender.tab.url) {
              message.frameURL = contentConnection.sender.url
            }
          }
        }).do(message => {
          observer.next({ tabId: contentConnection.tabId, from: 'content', to: 'panel', message: message })
        }).subscribe(panelConnection.message$)
        return () => {
          console.log('connection cleanup', panelConnection.tabId)
          panel2contentSubscription.unsubscribe()
          content2panelSubscription.unsubscribe()
        }
      }).takeUntil(Observable.merge(panelConnection.disconnect$, contentConnection.disconnect$))
    })
}).subscribe(communication => {
  console.log(communication)
})
