/* eslint-disable import/no-mutable-exports */
let debug = false;
if (typeof process === "object" && process.env) {
  debug = process.env.NODE_ENV === "development";
}
function noop() {
  // Do nothing
}

const log = debug ? console : { info: noop, log: noop, warn: noop };

export { debug, log };
export default { debug, log };
