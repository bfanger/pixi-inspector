/**
 * https://developer.chrome.com/extensions/devtools_panels
 */

import fromEvent from "./fromEvent";
import { ReplaySubject } from "rxjs/ReplaySubject";

export default class Panel {
  constructor(title, iconPath, pagePath) {
    this.visible$ = new ReplaySubject(1);
    chrome.devtools.panels.create(title, iconPath, pagePath, panel => {
      fromEvent(panel.onShown)
        .map(() => true)
        .subscribe(this.visible$);
      fromEvent(panel.onHidden)
        .map(() => false)
        .subscribe(this.visible$);
    });
  }
}
