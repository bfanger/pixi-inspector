import './common'
import connections$ from './devtools-rx/connections$'
import connection$ from './devtools-rx/connection$'
import { Observable } from 'rxjs/Observable'

const debug = true
console.info('pixi.background')

// const contentConnection$ = connections$.first().switchMap(connections => {
//   return Observable.of(...connections)
// }).concat(connection$).filter(connection => connection.name === 'content_scripts')

// contentConnection$.mergeMap(connection => {
  // return
// }).subscribe()

// Listen to DETECTED messages and show the PageAction icon
// @todo Hide on disconnect?
connection$.filter(connection => connection.name === 'content_scripts').mergeMap(connection => {
  const detected$ = connection.message$.filter(message => message.response === 'DETECTED')
  const detect$ = Observable.timer(1000).startWith(null).do(() => {
    connection.postMessage({ command: 'DETECT', from: 0 })
  })
  return Observable.merge(
    detect$.takeUntil(Observable.merge(connection.disconnect$, detected$)),
    detected$.do(message => {
      debug && console.log('DETECTED', { tabId: connection.sender.tab.id, path: message.data.path, version: message.data.version })
      const tabId = connection.sender.tab.id
      chrome.pageAction.show(tabId)
      chrome.pageAction.setTitle({ tabId, title: 'PixiJS ' + message.data.version })
    })
  )
}).subscribe()

connection$.mergeMap(connection => connection.message$.withLatestFrom(connections$).do(([message, connections]) => {
  if (message.broadcast) {
    const command = {
      command: message.broadcast,
      from: connection.id,
      id: message.id,
      data: message.data
    }
    const targets = Object.values(connections).filter(target => {
      if (target.id === connection.id) {
        return false // Don't broadcast back to sender
      }
      if (message.channel && target.name !== message.channel) {
        return false // Only to connection with a specific name
      }
      if (message.tabId && (!target.sender.tab || target.sender.tab.id !== message.tabId)) {
        return false // Only to connection inside a specific tab
      }
      return true
    })
    targets.forEach(target => target.postMessage(command))
  } else if (message.to === 0) {
    if (message.command === 'LOG') {
      console.log('Connection[' + connection.id + ']', message.data)
    } else if (message.command) {
      debug && console.log('Connection[' + connection.id + ']', message)
    }
  } else if (message.to) {
    const target = connections[message.to]
    if (!target) {
      debug && console.log('Couldn\'t deliver message', message, connections)
      connection.postMessage({
        error: 'DISCONNECTED',
        id: message.id
      })
      return
    }
    const _message = Object.assign({}, message)
    _message.from = connection.id
    delete _message.to
    target.postMessage(_message)
  } else {
    console.warn('to: is required for', message, 'from', connection)
  }
})).subscribe()
/**
 * For devtools_page and pixi_panel connection the tabId of the inspectedWindow is unknown
 * Wait for the INIT message which contains the tabId
 * @param {Connection} connection
 * @return {Observable}
 */
// function connectionWithTabId (connection) {
//   return connection.message$.first().switchMap((message) => {
//     if (message.command !== 'INIT') {
//       console.warn('Unexpected command', message)
//       return Observable.empty()
//     } else if (message.tabId === null) {
//       return Observable.empty()
//     }
//     connection.tabId = message.tabId
//     return Observable.of(connection)
//   })
// }

// const devtoolsConnection$ = connection$.filter(connection => connection.name === 'devtools_page').switchMap(connectionWithTabId)
// // const panelConnection$ = connection$.filter(connection => connection.name === 'pixi_panel').switchMap(connectionWithTabId)

// devtoolsConnection$.mergeMap(devtoolsConnection => {
//   // Send RETRY command to all content_scripts with same tabId and wait for a DETECTED message
//   const tabId = devtoolsConnection.tabId
//   const contentConnectionInTab$ = contentConnection$.filter(contentConnection => contentConnection.sender.tab.id === tabId)
//   // Send the detected configuration(s) to the devtools_page (and show the Pixi tab)
//   return contentConnectionInTab$.mergeMap(contentConnection => {
//     contentConnection.postMessage({ command: 'RETRY' })
//     return contentConnection.message$.first().do(config => {
//       if (config.command !== 'DETECTED') {
//         console.warn('Unexpected command', config)
//       } else {
//         devtoolsConnection.postMessage(config)
//       }
//     }).takeUntil(contentConnection.disconnect$)
//   })
  // Wait for the Panel(s) to connect and setup two-way communication
  // const panelCommunication$ = panelConnection$.switchMap(panelConnection => {
  //   return contentConnectionInTab$.mergeMap(contentConnection => {
  //     contentConnection.postMessage({ command: 'RETRY' })
  //     const disconnect$ = contentConnection.disconnect$.do(() => {
  //       panelConnection.postMessage({ command: 'DISCONNECTED', frameId: contentConnection.sender.frameId })
  //       console.log('report DISCONNECTED', panelConnection.tabId, contentConnection.sender.frameId)
  //     }).filter(() => false)
  //     return disconnect$.merge(Observable.create(observer => {
  //       const panel2contentSubscription = panelConnection.message$.do(message => {
  //         observer.next({ tabId: tabId, from: 'panel', to: 'content', message: message })
  //       }).subscribe(contentConnection.message$)
  //       const content2panelSubscription = contentConnection.message$.do(message => {
  //         if (message.command === 'DETECTED') {
  //           message.frameId = contentConnection.sender.frameId
  //           if (contentConnection.sender.url !== contentConnection.sender.tab.url) {
  //             message.frameURL = contentConnection.sender.url
  //           }
  //         }
  //       }).do(message => {
  //         observer.next({ tabId: tabId, from: 'content', to: 'panel', command: message.command, message: message })
  //       }).subscribe(panelConnection.message$)
  //       return () => {
  //         console.log('connection cleanup', panelConnection.tabId)
  //         panel2contentSubscription.unsubscribe()
  //         content2panelSubscription.unsubscribe()
  //       }
  //     }).takeUntil(Observable.merge(panelConnection.disconnect$, contentConnection.disconnect$)))
    // })
  // })
  // return Observable.merge(
    // showPanel$.filter(() => false),
    // panelCommunication$
  // )
// }).subscribe(communication => {
//   console.log(communication)
// })
