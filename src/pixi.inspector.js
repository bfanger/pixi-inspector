/* eslint-disable no-console */
import Inspector from "./services/Inspector";

if (typeof window.__PIXI_INSPECTOR_GLOBAL_HOOK__ === "undefined") {
  throw new Error("content_script was not (yet) executed");
}
if (!window.__PIXI_INSPECTOR_GLOBAL_HOOK__.Inspector) {
  window.__PIXI_INSPECTOR_GLOBAL_HOOK__.Inspector = Inspector;
} else {
  console.warn("pixi.inspector was already injected into the page");
}
