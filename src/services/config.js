let debug = false;
if (process.env.NODE_ENV === "development") {
  debug = true;
}
function noop() {
  // Do nothing
}

const log = debug ? console : { info: noop, log: noop, warn: noop };

export { debug, log };
export default { debug, log };
