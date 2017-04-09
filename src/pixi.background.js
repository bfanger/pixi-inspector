import './common'
import connections$ from './devtools-rx/connections$'
import connection$ from './devtools-rx/connection$'
import { Observable } from 'rxjs/Observable'

console.info('pixi.background')

const contentConnection$ = connections$.first().switchMap(connections => {
  return Observable.of(...connections)
}).concat(connection$).filter(connection => connection.name === 'content_scripts')

// Listen to DETECTED messages and show the PageAction icon
contentConnection$.mergeMap(connection => {
  return connection.message$.filter(message => message.command === 'DETECTED').do(message => {
    const tabId = connection.sender.tab.id
    chrome.pageAction.show(tabId)
    chrome.pageAction.setTitle({ tabId, title: 'PixiJS ' + message.version })
    // @todo Hide on disconnect?
  })
}).subscribe()

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

devtoolsConnection$.mergeMap(devtoolsConnection => {
  // Send RETRY command to all content_scripts with same tabId and wait for a DETECTED message
  const tabId = devtoolsConnection.tabId
  const contentConnectionInTab$ = contentConnection$.filter(contentConnection => contentConnection.sender.tab.id === tabId)
  // Send the detected configuration(s) to the devtools_page (and show the Pixi tab)
  const showPanel$ = contentConnectionInTab$.mergeMap(contentConnection => {
    contentConnection.postMessage({ command: 'RETRY' })
    return contentConnection.message$.first().do(config => {
      if (config.command !== 'DETECTED') {
        console.warn('Unexpected command', config)
      } else {
        devtoolsConnection.postMessage(config)
      }
    }).takeUntil(contentConnection.disconnect$)
  })
  // Wait for the Panel(s) to connect and setup two-way communication
  const panelCommunication$ = panelConnection$.switchMap(panelConnection => {
    return contentConnectionInTab$.mergeMap(contentConnection => {
      contentConnection.postMessage({ command: 'RETRY' })
      return Observable.create(observer => {
        const panel2contentSubscription = panelConnection.message$.do(message => {
          observer.next({ tabId: tabId, from: 'panel', to: 'content', message: message })
        }).subscribe(contentConnection.message$)
        const content2panelSubscription = contentConnection.message$.do(message => {
          if (message.command === 'DETECTED') {
            if (contentConnection.sender.url !== contentConnection.sender.tab.url) {
              message.frameURL = contentConnection.sender.url
            }
          }
        }).do(message => {
          observer.next({ tabId: tabId, from: 'content', to: 'panel', command: message.command, message: message })
        }).subscribe(panelConnection.message$)
        return () => {
          console.log('connection cleanup', panelConnection.tabId)
          panel2contentSubscription.unsubscribe()
          content2panelSubscription.unsubscribe()
        }
      }).takeUntil(Observable.merge(panelConnection.disconnect$, contentConnection.disconnect$))
    })
  })
  return Observable.merge(
    showPanel$.filter(() => false),
    panelCommunication$
  )
}).subscribe(communication => {
  console.log(communication)
})
