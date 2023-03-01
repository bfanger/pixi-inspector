# PixiJS Devtools

Browser extension to debug games and apps written with [Pixi.js](http://pixijs.com/).

## Installation

Install [PixiJS Devtools from the Chrome Web Store](https://chrome.google.com/webstore/detail/pixi-inspector/aamddddknhcagpehecnhphigffljadon)

## Usage

In _your code_ find where the `PIXI.Application` instance is created, it looks like this:

```js
import { Application } from "pixi.js";

const app = new Application({
```

Expose that `app` to the **PixiJS Devtools** by add the line:

```js
window.__PIXI_APP__ = app;
```

or depending on your Typscript and ESLint configuration:

```ts
(window as any).__PIXI_APP__ = app; // eslint-disable-line
```
