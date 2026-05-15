This is a mono repo containing Svelte & Typescript projects & packages used for building a Browser extension to debug game engines like Pixi.js

## File Structure

```
├── apps/                   # Example projects and Browser extensions
│   ├── bunnymark/          # Benchmarking app
│   ├── chrome-extension/   # Chrome browser extension
│   ├── firefox-extension/  # Firefox browser extension
│   ├── example-phaser-project/
│   └── example-pixi-project/
│
├── packages/               # Shared packages
│   ├── blender-elements/   # Blender-inspired UI components
│   ├── pixi-panel/         # The pixi.js dev browser extension
│   └── ui-protocol/        # UI protocol definitions
│
├── docs/                   # Documentation
```

## Formatting

When writing or editing code try to follow Prettier formatting rules using the default prettier settings.

## Linting

Before running lint run `npm run format` in the mono-repo root and fix these issues first.

The projects and packages are linted by the `npm run lint` command in the mono-repo root (typically the pixi-inspector folder)
