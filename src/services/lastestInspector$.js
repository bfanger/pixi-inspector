import AsyncInspector from "./AsyncInspector";
import connection from "./connection";
import { Observable } from "rxjs/Observable";
import instances$ from "./instances$";

/**
 * Select in the last frame (with pixi) the last detected pixi instance.
 */
export const latestInstance$ = instances$.map(frames => {
  if (frames.length === 0) {
    return null;
  }
  const frame = frames[frames.length - 1];
  if (frame.data.length === 0) {
    return null;
  }
  const instance = frame.data[frame.data.length - 1];
  return {
    version: instance.version,
    status: instance.status,
    connection: frame.from,
    frameURL: frame.frameURL,
    index: frame.data.length - 1
  };
});
/**
 * Create a AsyncInspector for the detected instance
 */
const latestInspector$ = latestInstance$
  .switchMap(instance => {
    if (instance === null) {
      return Observable.of(null);
    }
    return connection
      .to(instance.connection)
      .get("INSPECTOR", instance.index)
      .switchMap(index =>
        Observable.create(observer => {
          const inspector = new AsyncInspector(index, {
            frameURL: instance.frameURL
          });
          observer.next(inspector);
          inspector.enable();
          return () => {
            inspector.disable();
          };
        })
      );
  })
  .startWith(null)
  .shareReplay(1);

latestInspector$.method = function(method) {
  return this.map(
    inspector =>
      function(...args) {
        if (inspector === null) {
          /* eslint-disable no-console */
          console.log("No inspector available");
          /* eslint-enable */
          return;
        }
        return inspector[method](...args);
      }
  );
};

export default latestInspector$;
