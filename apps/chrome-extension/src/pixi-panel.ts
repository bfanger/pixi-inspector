import PixiPanel from "pixi-panel/src/PixiPanel.svelte";
import type { BridgeFn } from "pixi-panel/src/types";

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

// eslint-disable-next-line no-new
new PixiPanel({
  target: document.body,
  props: { bridge },
});

declare const WATCH: boolean | undefined;
if (WATCH) {
  new EventSource("http://localhost:10808/esbuild").addEventListener(
    "change",
    () => {
      bridge("window.location.reload()");
      window.location.reload();
    }
  );
}
