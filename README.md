# PixiJS Devtools

Browser extension to debug games and apps written with [PixiJS](http://pixijs.com/).

## Features

- Show the scene graph
- View and edit properties
- Double-click in the outliner to console.log a node
- Outline the active node in the viewport.
- The active node is available in the developer console as `$pixi`
- Right-click (or alt click) in the viewport to activate a node

## Installation

Install PixiJS Devtools from:

- [Chrome Web Store](https://chrome.google.com/webstore/detail/pixi-inspector/aamddddknhcagpehecnhphigffljadon)
- [Add-ons for Firefox](https://addons.mozilla.org/en-US/firefox/addon/pixijs-devtools/)

## Usage

### PixiJS

In _your code_ find where the `PIXI.Application` instance is created, it looks like this:

```js
import { Application } from "pixi.js";

const app = new Application(...)
```

Expose that `app` to the **PixiJS Devtools** by adding the line:

```js
globalThis.__PIXI_APP__ = app;
```

or depending on your TypeScript and ESLint configuration:

```ts
(globalThis as any).__PIXI_APP__ = app; // eslint-disable-line
```

### Phaser

In _your code_ find where the `Phaser.Game` instance is created, it looks like this:

```js
import Phaser from "phaser";

const game = Phaser.Game(...)
```

Expose that `game` to the **PixiJS Devtools** by adding the line:

```js
globalThis.__PHASER_GAME__ = game;
```

## Custom setup?

If you don't use a `PIXI.Application` or `Phaser.Game`?
you can specify the root-node manually with:

```js
globalThis.__PIXI_STAGE__ = yourContainer;
```

And to enable highlighting and selecting the nodes in the viewport add:

```js
globalThis.__PIXI_RENDERER__ = yourRenderer;
```
