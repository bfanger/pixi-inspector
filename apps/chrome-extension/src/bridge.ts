import type { Bridge } from "pixi-panel/types";
function execute<T>(code: string): Promise<T> {
  return new Promise((resolve, reject) => {
    chrome.devtools.inspectedWindow.eval(code, (result, err) => {
      if (err) {
        reject(new Error(err.value || err.description || err.code));
      } else {
        resolve(result as T);
      }
    });
  });
}
function inject(global: string, factory: Function): Promise<void> {
  const code = `(window['${global}'] = (${factory.toString()})()) && true`;
  return execute(code);
}
const bridge: Bridge = { execute, inject };
export default bridge;
