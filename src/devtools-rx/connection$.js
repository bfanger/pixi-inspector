import fromEvent from "./fromEvent";
import Connection from "./Connection";
let autoIncrement = 1;

export default fromEvent(chrome.runtime.onConnect)
  .map(port => {
    const connection = new Connection(port);
    connection.id = autoIncrement;
    autoIncrement++;
    if (port.sender && port.sender.tab) {
      connection.tabId = port.sender.tab.id;
    }
    return connection;
  })
  .publish()
  .refCount();
