import { merge, of } from "rxjs";
import { switchMap } from "rxjs/operators";
import fromChromeEvent from "./fromChromeEvent";

export default merge(
  of(null),
  fromChromeEvent(chrome.tabs.onHighlighted),
  fromChromeEvent(chrome.tabs.onRemoved)
).pipe(
  switchMap(
    () =>
      new Promise(resolve => {
        chrome.tabs.query({ highlighted: true }, resolve);
      })
  )
);
