import type { BridgeFn } from "pixi-panel/src/types";
import PixiPanelLegacy from "pixi-panel/src/PixiPanelLegacy.svelte";
import { mount } from "svelte";

const bridge: BridgeFn = (code: string) =>
  new Promise((resolve, reject) => {
    chrome.devtools.inspectedWindow.eval<any>(code, (result, err) => {
      if (err) {
        if (err instanceof Error) {
          reject(err);
        }
        reject(new Error(err.value || err.description || err.code));
      }
      resolve(result);
    });
  });

mount(PixiPanelLegacy, {
  target: document.body,
  props: { bridge },
});
