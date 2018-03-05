import { Observable } from "rxjs/Observable";
import connection from "./connection";
import active$ from "./active$";

/**
 * @var {Observable} All frames which have detected one ore more PIXI instances.
 */
export default active$.switchMap(active => {
  if (!active) {
    return Observable.of([]);
  }
  connection.to("content_scripts").send("DETECT");
  const frames = [];
  // @todo Detect when a frame was closed/reloaded.
  return connection
    .on("DETECTED")
    .startWith(null)
    .switchMap(() => connection.to("content_scripts").stream("INSTANCES"))
    .switchMap(message => {
      const index = frames.findIndex(frame => frame.from === message.from);
      if (message.data.length === 0) {
        if (index === -1) {
          return Observable.empty();
        }
        frames.splice(index, 1);
        return Observable.of(frames);
      }
      // chrome.devtools.inspectedWindow.eval('console.info(window.PIXI || "no pixi :(")', { frameURL: message.frameURL }, function (...args) {
      //   connection.log(...args)
      // })
      if (index === -1) {
        frames.push(message);
      } else {
        frames[index] = message;
      }
      return Observable.of(frames);
    })
    .merge(
      connection
        .on("DISCONNECTED")
        .map(message => frames.filter(frame => frame.from !== message.from))
    );
});
