# PixiJS Devtools

Browser extension to debug games and apps written with [PixiJS](http://pixijs.com/).

## Features

- Show the scene graph
- View and edit properties
- Outline the active node in the viewport.
- The active node is available in the developer console as `$pixi`
- Right-click in the viewport to activate a node

## Installation

Install [PixiJS Devtools from the Chrome Web Store](https://chrome.google.com/webstore/detail/pixi-inspector/aamddddknhcagpehecnhphigffljadon)

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
