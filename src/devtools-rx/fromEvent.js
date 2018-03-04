import { Observable } from "rxjs/Observable";

export default function fromEvent(onEvent) {
  return Observable.create(observer => {
    function listener(event, ...args) {
      if (arguments.length === 1) {
        observer.next(event);
      } else {
        observer.next([event, args]);
      }
    }
    onEvent.addListener(listener);
    return () => {
      onEvent.removeListener(listener);
    };
  });
}
