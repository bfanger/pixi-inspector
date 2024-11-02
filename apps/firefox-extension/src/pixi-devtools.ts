let iconPath = "";

browser.devtools.inspectedWindow
  .eval("window.matchMedia('(prefers-color-scheme: dark)').matches")
  .then((result) => {
    // Detected darkmode.
    // Note: This assumes devtools uses the same mode as the browser.
    if (Array.isArray(result)) {
      iconPath = result[0] ? "panel-icon@dark.svg" : "panel-icon@light.svg";
    }
  })
  .finally(async () => {
    await browser.devtools.panels.create("PixiJS", iconPath, "pixi-panel.html");
  });
