# Version 3

## Vision

- Feel like a visual editor, with things like a move and scale gizmos.
- There have been requests of making the input fields respond to arrow keys, but what if you could click on a sprite and move it in both dimensions with the arrow keys.
  "Where we're going, we don't need ~~roads~~ _input fields_ - Dr. Emmett Brown"

## Learnings from v2

Building a multi-engine, multi-version devtools is a hard problem.

### The one type to represent them all

Pixi.js v8 has a cleaner, but different API compared to previous versions of Pixi.js and Phaser.js also has a different api.
In v2 we created an abstraction, but this created a [big weak type](https://en.wikipedia.org/wiki/God_object): NodeProperties.
This is a type that contains a lot of properties and almost all of them optional.
Creating a UI that switches based on available fields is troublesome, it also creates mapping problems as all underlying data models must map to this abstraction.

### Frontend Framework

React, Vue and Svelte are all build with the use-case: "Render the UI and update based on intermittent/small state changes" in mind.
But games can change anything in the scene 60 times per second, this in combination with no direct access/communication, forces a trade off between showing the current value and performance impact.

### Moving from v1 to v2

With chrome extension becoming stricter in combination with a rewrite resulting in shipping a version that was missing features.
This resulted in frustration of users.

### The DX of making chrome extensions

Writing and debugging a devtool panel inside a devtool panel works, but isn't a nice experience.

## Technical design

### Dual mode

By embedding v2 into v3, it will allow users to keep using the extension as-is in "legacy mode" and switch to the new mode when the new version is an improvement for them.

V3 new mode will focus is on bringing the best experience for the latest version of Pixi.js.
But should also make porting these features possible without relying on too many if statements.

### UI Protocol

Instead of sending data to the devtools panel we'll sent the UI in a serializable format. A vdom-ish approach.

This decouples the data from how it is presented.
This also prevents serializing data that is not visible.

This means all state lives on the page, and the panel doesn't have state.

This also opens up possibility of adapters for other game engines, it can represent properties for 2D and 3D render engines, but also for physics engines and more.

### Gizmos first (edit mode)

Gizmo's are interactive controls placed on top of the canvas.
An example is the move gizmo: Which are 2 arrows shown on top of the selected sprite, by clicking and dragging an arrow the sprite moves along that axis.

Gimzo and other editors elements will run in the context of page and have direct access to the objects they are reading an writing to.

## Adapters

Adapters run in the same context as the engine.
An adapter is purposely build and deeply connected to a specific version of an engine.
The Pixi_v8 adapter will use shared utility functions, this allows reusing code for when the underlying structure is the same between versions.
