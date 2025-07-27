import type { BridgeFn } from "pixi-panel/src/types";
import PixiPanel from "pixi-panel/src/PixiPanelLegacy.svelte";
import { mount } from "svelte";

const bridge: BridgeFn = (code: string) =>
  new Promise((resolve, reject) => {
    chrome.devtools.inspectedWindow.eval(code, (result, err) => {
      if (err) {
        if (err instanceof Error) {
          reject(err);
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
