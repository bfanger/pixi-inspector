import type { BridgeFn } from "pixi-panel/src/types";
import PixiPanel from "pixi-panel/src/PixiPanel.svelte";
import { mount } from "svelte";

const bridge: BridgeFn = (code: string) =>
  new Promise((resolve, reject) => {
    chrome.devtools.inspectedWindow.eval(code, (result, err) => {
      if (err) {
        if (err instanceof Error) {
          reject(err);
        }
        const parts = err.description?.split("%s") ?? [];
        if (parts.length > 1 && Array.isArray(err.details)) {
          let message = "";
          for (let i = 0; i < parts.length; i++) {
            message += parts[i];
            if (i > 0 && err.details && err.details[i - 1] !== undefined) {
              message += JSON.stringify(err.details[i - 1]);
            }
          }
          reject(new Error(message));
        }
        reject(new Error(err.value || err.description || err.code));
      }
      resolve(result as any);
    });
  });
mount(PixiPanel, {
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
    },
  );
}
