import PixiPanel from "pixi-panel/src/PixiPanel.svelte";
import { mount } from "svelte";

mount(PixiPanel, {
  target: document.body,
  props: { listen, createBridge },
});

function listen(
  setUrls: (urls: string[]) => void,
  setRefresh: (fn: () => void) => void,
) {
  function refresh() {
    chrome.devtools.inspectedWindow.getResources((resources) => {
      let firstDocument = true;
      const frameUrls = new Set<string>();
      for (const resource of resources) {
        if ((resource as any).type === "document") {
          if (firstDocument) {
            frameUrls.add("");
            firstDocument = false;
          } else {
            frameUrls.add(resource.url);
          }
        }
      }
      setUrls(Array.from(frameUrls));
    });
  }
  refresh();
  setRefresh(refresh);

  function callback(resource: any) {
    if (resource.type === "document") {
      refresh();
    }
  }
  chrome.devtools.inspectedWindow.onResourceAdded.addListener(callback);
  return () => {
    chrome.devtools.inspectedWindow.onResourceAdded.removeListener(callback);
  };
}

function createBridge(frameURL: string) {
  return (code: string) =>
    new Promise<any>((resolve, reject) => {
      chrome.devtools.inspectedWindow.eval(
        code,
        frameURL ? { frameURL } : {},
        (result, err) => {
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
        },
      );
    });
}

declare const WATCH: boolean | undefined;
if (WATCH) {
  new EventSource("http://localhost:10808/esbuild").addEventListener(
    "change",
    () => {
      Promise.try(() =>
        chrome.devtools.inspectedWindow.eval("location.reload()"),
      );
      window.location.reload();
    },
  );
}
