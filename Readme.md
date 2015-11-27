# Pixi Inspector

An extension to the Chrome DevTools for inspecting Pixi.js games/applications.

## Installation

Install (Pixi Inspector from the Chrome Web Store)[https://chrome.google.com/webstore/detail/pixi-inspector/aamddddknhcagpehecnhphigffljadon]

## Features

* Shows the scene graph
* View and edit the properties of the selected node
* The selected node is available in the Console as `$pixi`
* Highlight (the bounds of) the node on hover
* Select a node with the mouse.

To use the inspector on the [pixi.js example site](http://pixijs.github.io/examples/)
run `__PIXI_INSPECTOR_GLOBAL_HOOK__.use(frames[0].PIXI);` to point the inspector to the PIXI instance in the iframe.

## Build from source
 
* git clone git@github.com:bfanger/pixi-inspector.git
* cd pixi-inspector
* npm install
* npm run build
* Go to [chrome://extensions/](chrome://extensions/), click `load unpacked extension...` and browse to the build folder. 
 
### Development

Run `npm start` and open http://localhost:8090/webpack-dev-server/tests/ (or http://localhost:8090/tests/)

This loads the pixi-inspector into the same page as an example PIXI scene, which makes debugging easier. 
However in the chrome-extension environment, you don't have direct access to the PIXI object or console.log (The injected pixi.inspector.js is the exception)
Use the [proxy](src/services/proxy.js) service to interact with the inspected page. 

When the inspector works in the test environment run:  
`gulp continuous-build`
Set `var DEBUG = true;` in [PixiPanel](src/components/PixiPanel.js) which adds a button to load the changed code.
