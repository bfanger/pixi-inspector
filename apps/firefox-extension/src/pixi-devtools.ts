let iconPath = "";
// Detect darkmode.
// This only works when devtools uses the same mode as the browser.
browser.devtools.inspectedWindow
  .eval("window.matchMedia('(prefers-color-scheme: dark)').matches")
  .then((result) => {
    if (Array.isArray(result)) {
      iconPath = result[0] ? "panel-icon@dark.svg" : "panel-icon@light.svg";
    }
  })
  .finally(() => {
    browser.devtools.panels.create("PixiJS+", iconPath, "pixi-panel.html");
  });
