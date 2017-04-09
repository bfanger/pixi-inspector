import fromEvent from './fromEvent'
import Connection from './Connection'

export default fromEvent(chrome.runtime.onConnect).map(port => new Connection(port))

