import { of, empty } from "rxjs";
import { switchMap, startWith, merge, map } from "rxjs/operators";
import connection from "./connection";
import active$ from "./active$";

/**
 * @var {Observable} All frames which have detected one ore more PIXI instances.
 */
export default active$.pipe(
  switchMap(active => {
    if (!active) {
      return of([]);
    }
    connection.to("content_scripts").send("DETECT");
    const frames = [];
    // @todo Detect when a frame was closed/reloaded.
    return connection.on("DETECTED").pipe(
      startWith(null),
      switchMap(() => connection.to("content_scripts").stream("INSTANCES")),
      switchMap(message => {
        const index = frames.findIndex(frame => frame.from === message.from);
        if (message.data.length === 0) {
          if (index === -1) {
            return empty();
          }
          frames.splice(index, 1);
          return of(frames);
        }
        // chrome.devtools.inspectedWindow.eval('console.info(window.PIXI || "no pixi :(")', { frameURL: message.frameURL }, function (...args) {
        //   connection.log(...args)
        // })
        if (index === -1) {
          frames.push(message);
        } else {
          frames[index] = message;
        }
        return of(frames);
      }),
      merge(
        connection
          .on("DISCONNECTED")
          .pipe(
            map(message => frames.filter(frame => frame.from !== message.from))
          )
      )
    );
  })
);
