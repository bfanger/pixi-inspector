export default function asyncEval(code, target) {
  return new Promise((resolve, reject) => {
    chrome.devtools.inspectedWindow.eval(
      code,
      target,
      (result, exceptionInfo) => {
        if (exceptionInfo) {
          if (exceptionInfo.isException) {
            reject(exceptionInfo.value);
          } else if (exceptionInfo.isError) {
            if (
              exceptionInfo.description.match(/%s/) &&
              exceptionInfo.details.length === 1
            ) {
              reject(exceptionInfo.description);
            }
          }
          reject(exceptionInfo);
        } else {
          resolve(result);
        }
      }
    );
  });
}
