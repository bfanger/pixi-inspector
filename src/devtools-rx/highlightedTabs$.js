import { Observable } from "rxjs/Observable";
import fromEvent from "./fromEvent";

export default Observable.merge(
  Observable.of(null),
  fromEvent(chrome.tabs.onHighlighted),
  fromEvent(chrome.tabs.onRemoved)
).switchMap(
  () =>
    new Promise(resolve => {
      chrome.tabs.query({ highlighted: true }, resolve);
    })
);
