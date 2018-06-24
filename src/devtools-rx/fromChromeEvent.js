import { Observable } from "rxjs";

/**
 * Use an event object from the Chrome API as observable.
 * https://developer.chrome.com/extensions/events
 * @return {Observable}
 */
export default function fromChromeEvent(onEvent) {
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
