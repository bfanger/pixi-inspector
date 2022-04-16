import type { Bridge } from "pixi-panel/types";
const bridge: Bridge = {
  eval<T>(code: string): Promise<T> {
    return new Promise((resolve, reject) => {
      console.log(code);
      chrome.devtools.inspectedWindow.eval(code, (result, err) => {
        console.log(err);
        if (err) {
          reject(new Error(err.value));
        } else {
          console.log(result);
          resolve(result as T);
        }
      });
    });
  },
};
export default bridge;
