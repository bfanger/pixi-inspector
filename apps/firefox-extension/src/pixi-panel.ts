import PixiPanel from "pixi-panel/src/PixiPanel.svelte";
import { mount } from "svelte";

mount(PixiPanel, {
  target: document.body,
  props: { createListener, createBridge },
});

function createListener(
  setUrls: (urls: string[]) => void,
  setRefresh: (fn: () => void) => void,
) {
  function refresh() {
    setUrls([""]);
  }
  refresh();
  setRefresh(refresh);
  return () => undefined;
}

function createBridge() {
  return (code: string) =>
    new Promise<any>((resolve, reject) => {
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
        resolve(result);
      });
    });
}
