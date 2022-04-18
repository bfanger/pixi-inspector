import PixiPanel from "pixi-panel/PixiPanel.svelte";
import type { BridgeFn } from "pixi-panel/types";
import livereload from "./livereload";

declare const WATCH: string;
if (WATCH) {
  livereload();
}

const bridge: BridgeFn = (code: string) => {
  return new Promise((resolve, reject) => {
    chrome.devtools.inspectedWindow.eval(code, (result, err) => {
      if (err) {
        reject(new Error(err.value || err.description || err.code));
      }
      resolve(result as any);
    });
  });
};

new PixiPanel({
  target: document.body,
  props: { bridge },
});
