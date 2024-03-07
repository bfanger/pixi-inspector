import PixiPanel from "pixi-panel/src/PixiPanel.svelte";
import type { BridgeFn } from "pixi-panel/src/types";

const bridge: BridgeFn = (code: string) =>
  new Promise((resolve, reject) => {
    chrome.devtools.inspectedWindow.eval(code, (result, err) => {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (err) {
        if (err instanceof Error) {
          reject(err);
        }
        reject(new Error(err.value || err.description || err.code));
      }
      resolve(result as any);
    });
  });

// eslint-disable-next-line no-new
new PixiPanel({
  target: document.body,
  props: { bridge },
});
