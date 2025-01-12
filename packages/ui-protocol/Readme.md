# UI Protocol

A Chrome DevTools panel has no direct access to the actual javascript objects on the inspected page and it's also very difficult to send information from the page to the DevTools panel, but the DevTools panel can ask for information.

UI Protocol takes inspiration from HTML, but HTML serializes UI to a string and UI Protocol uses JSON as format and only received a UI patch.

## Departure from MVC

To show information from the inspected page we need to serialize that information, in the past we standardized format of data "model" so a Sprite from Phaser and Pixi looked the same. It's become increasingly difficult to normalize the data as the extension tries supports all Pixi.js & Phaser versions.

UI Protocol flips the concept, the UI is described in standardized format and is constructed and managed on the inspected page.
So which inputs are shown where and with which label are defined and controlled on the inspected page.

This ensures only data that is visible in the UI is sent to the DevTools panel.

## Considerations

Writing the UI in a xml-like format like JSX would be nice and feel familiar, but this would create a lot of overhead.

```jsx
const ui = (
  <panel>
    <vector-input
      labels={["Position X", "Y", "Z"]}
      values={[sprite.position.x, sprite.position.y, sprite.position.z]}
      onchange="setPosition(event)"
    />
  </panel>
);
```

Games update at 60FPS and we don't want to create a new ui tree very often.

Therefore the UI Protocol mutates the tree in-place based on small patches.

UI Protocol uses a messaging definitions that allows creating and updating UI in an serialized format.
The code running with direct access to the game has controls the ui but doesn't render it.

## Synchronization

The inspected page maintains a virtual component tree of Controller nodes, that tree is a snapshot of the tree, it is the state of the component tree in the DevTools panel.
Nodes of that tree are connected to actual game objects, but updates to the tree are not initiated by the game objects.
The tree is not the actual UI and also doesn't contain that actual data.

The DevTools also maintains a virtual component tree, but with Display nodes, that tree is also a snapshot the tree, but node are not connected to Game object they are connected to UI components.

The DevTools panel initiates the synchronization, but the first step of the synchronization takes place in the inspected page.
DevTools can send events and updated data (onchange)

The inspected page walks the tree and for each node determines if the tree need to change, or value in the node are updated.
This `syncTree()` is creates a patch in the UI protocol format and updates the virtual tree in the inspected page.

The patch that was created is received by the DevTools panel and is applied to the virtual tree in the DevTools panel `applyPatch()`.
During this process the actual UI is also created and updated.

## A Remote UI patch

```json
{
  "data": [
    {
      "path": [0, 1],
      "data": 123
    }
  ],
  "replacements": [],
  "appends": [
    {
      "path": [0, 2],
      "component": "NumberInput",
      "props": { "label": "Speed" },
      "data": 1
    }
  ],
  "truncates": [{ "path": [1], "length": 1 }]
}
```

props are applied first, then data, then replacements, after that the appends and finally the truncations.
