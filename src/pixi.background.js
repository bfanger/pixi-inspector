import './common'
import connections$ from './devtools-rx/connections$'
// import connection$ from './devtools-rx/connection$'
import highlightedTabs$ from './devtools-rx/highlightedTabs$'
import { Observable } from 'rxjs/Observable'

console.info('pixi.background')

// // RAW
// /*global chrome */
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

connections$.switchMap(connections => {
  return Observable.merge(...connections.map(connection => connection.message$.map(message => ({ connection, message }))))
}).withLatestFrom(highlightedTabs$).subscribe(([{ message, connection }, highlightedTabs]) => {
  const activeTab = highlightedTabs.find(tab => tab.id === connection.sender.tab.id)
  console.log(message, activeTab ? activeTab.id : false)
})
// connection$.do(connection => {
//     console.log('onConnect', connection)
//     connection.postMessage('background')
//     // connection.message$.subscribe(message => {
//     //     console.log('onMessage', message)
//     // })
//     // setTimeout(() => {
//     //     console.log(connection.disconnect$)
//     //     connection.disconnect$.subscribe(() => {
//     //         console.log('ok')
//     //     })
//     //     connection.disconnect$.next()
//     // }, 1000)
// })
// // .mergeMap(connection => connection.message$.do(message => {
// //     console.log('onMessage', message)
// // }))
// .subscribe(() => {
//     console.log('tick')
// })
