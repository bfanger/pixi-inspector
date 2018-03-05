/* eslint-disable import/no-mutable-exports */
let debug = false;
if (typeof process === "object" && process.env) {
  if (process.env.NODE_ENV === "production") {
    debug = false;
  } else {
    debug = !!process.env.DEBUG_DEVTOOLS_RX;
  }
}
export default debug;
