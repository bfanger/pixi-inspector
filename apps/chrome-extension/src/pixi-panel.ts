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
  // Discover all iframe URLs by probing the DOM recursively.
  // This catches nested iframes that getResources/onResourceAdded miss
  // after navigation (a Chrome DevTools bug with nested cross-origin frames).
  const discoverFramesCode = `(function() {
    var urls = [];
    function walk(doc) {
      try {
        var frames = doc.querySelectorAll('iframe');
        for (var i = 0; i < frames.length; i++) {
          if (frames[i].src) urls.push(frames[i].src);
          try { walk(frames[i].contentDocument); } catch(e) {}
        }
      } catch(e) {}
    }
    walk(document);
    return JSON.stringify(urls);
  })()`;

  function refresh() {
    chrome.devtools.inspectedWindow.getResources((resources) => {
      let firstDocument = true;
      const frameUrls = new Set([""]);
      for (const resource of resources) {
        if ((resource as any).type === "document") {
          if (firstDocument) {
            firstDocument = false;
          } else {
            frameUrls.add(resource.url);
          }
        }
      }

      // Also discover nested iframes via DOM traversal
      chrome.devtools.inspectedWindow.eval(discoverFramesCode, (result) => {
        if (result) {
          try {
            for (const url of JSON.parse(result as unknown as string)) {
              frameUrls.add(url);
            }
          } catch {
            // Ignore malformed JSON from eval
          }
        }
        setUrls(Array.from(frameUrls));
      });
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

  // Periodically re-scan for frames that onResourceAdded may have missed
  // (common with cross-origin iframes loaded after initial page render)
  // or whose contexts were invalidated by page reload/navigation.
  const rescanInterval = setInterval(refresh, 2_000);

  return () => {
    chrome.devtools.inspectedWindow.onResourceAdded.removeListener(callback);
    clearInterval(rescanInterval);
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
