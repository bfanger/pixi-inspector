# Overview

- apps
  - chrome-extension: Contains Chrome specific code
  - example-pixi-project: Project that exposes the PIXI.Application as `__PIXI_APP__` for debugging.
- packages:
  - pixi-panel: The UI to debug a PixiJS application
  - blender-elements: Standalone UI components that mimic the Blender UI

# pixi-devtools

The `__PIXI_DEVTOOLS__` is constructed using the code in `pixi-panel/src/pixi-devtools/*`
These files can't use imports because they are eval'd in the context of the inspected page.

The connect.ts is continuously checking if a PIXI.Application or Phaser.Game is exposed a `__PIXI_APP__` or `__PHASER_APP__` respectively.
