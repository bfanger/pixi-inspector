import connection from './connection'
export default connection.to('devtools_page').stream('PANEL_VISIBLE')
  .map(message => message.data)
  .shareReplay(1)
