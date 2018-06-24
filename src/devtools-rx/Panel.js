/**
 * https://developer.chrome.com/extensions/devtools_panels
 */

import { ReplaySubject } from "rxjs";
import { map } from "rxjs/operators";
import fromChromeEvent from "./fromChromeEvent";

export default class Panel {
  constructor(title, iconPath, pagePath) {
    this.visible$ = new ReplaySubject(1);
    chrome.devtools.panels.create(title, iconPath, pagePath, panel => {
      fromChromeEvent(panel.onShown)
        .pipe(map(() => true))
        .subscribe(this.visible$);
      fromChromeEvent(panel.onHidden)
        .pipe(map(() => false))
        .subscribe(this.visible$);
    });
  }
}
