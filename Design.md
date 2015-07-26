# Plugin design

## Caveats for Chrome Extensions

* Can't push events directly to the dev-tools panel.
* Can eval scripts inside, but
  * Results are asynchronous 
  * Results are not references, but serialized/deserialized data.    

https://developer.chrome.com/extensions/devtools_panels

## Structure

The code that interacts direcly with PIXI is in src/pixi.inspector.js which is injected when PIXI is detected on the page.
  
The PixiPanel uses polling to:
1. Detect PIXI
2. Update the UI, by calling PIXI.inspector methods.

PIXI.inspector methods preprocess return values to return the  minimal amount of data to minimize the serialization overhead.
