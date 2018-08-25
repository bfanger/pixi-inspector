# Pixi Inspector

An extension to the Chrome DevTools for inspecting Pixi.js games/applications.

## Installation

Install (Pixi Inspector from the Chrome Web Store)[https://chrome.google.com/webstore/detail/pixi-inspector/aamddddknhcagpehecnhphigffljadon]

## Features

* Shows the scene graph
* View and edit the properties of the selected node
* The selected node is available in the Console as `$pixi`
* Highlight (the bounds of) the node on hover
* Right click on the canvas to select the node at that position.
* Use shielded symbols("\") for set value null or NaN or undefined otherwise will be set "null" or "NaN" or "undefined" like string. Example use "\null" => null, "\NaN" => NaN, "\undefined" => undefined

## Build from source

* git clone git@github.com:bfanger/pixi-inspector.git
* cd pixi-inspector
* npm install
* npm run build
* Go to [chrome://extensions/](chrome://extensions/), click `load unpacked extension...` and browse to the build folder.

### Development

Run `npm run dev` and open http://localhost:8080/webpack-dev-server/tests/ (or http://localhost:8080/tests/)

This loads the pixi-inspector into the same page as an example PIXI scene, which makes debugging easier.
However in the chrome-extension environment, you don't have direct access to the PIXI object or console.log (The injected pixi.inspector.js is the exception)
Use the [AsyncInspector](src/services/AsyncInspector.js) service to interact with the inspected page from the panel.

Run `npm run build:watch` and load the unpacked extension from the build folder.
To ensure the latest code is running, refresh the extensions page, close devtools, refresh the page and reopen devtools.

Run `DEBUG_DEVTOOLS_RX=1 npm run build:watch` to debug the communication between the differrent processen.