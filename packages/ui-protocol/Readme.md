# UI Protocol

Because the UI (in the DevTools panel) has no direct access to the actual objects we need to serialize the UI & events.

UI Protocol is a messaging definitions that allows creating and updating UI in an serialized format.
The code running with direct access to the game has controls the ui but doesn't render it, the render
UI Protocol takes inspiration from HTML.
HTML serializes to a string, but in UI Protocol uses JSON as serialization format.

By using JSON can also use primitive values like numbers, booleans and simple objects and arrays.

## Considerations

Writing the UI in a xml-like format like JSX would be nice and feel familiar, but this would create a lot of overhead.

```jsx
const ui = (
  <panel>
    <input-vec3
      label="Position"
      x={sprite.position.x}
      y={sprite.position.y}
      z={sprite.position.z}
      onchange="setPosition(event)"
    />
  </panel>
);
```

Games update at 60FPS and we don't want to create the full ui tree on every frame.

Therefore the UI Protocol mutates the tree in-place and creates small diffs based on those mutations.

## A Remote UI diff

```json
{
  "updates": [
    {
      "p": [0, 1],
      "d": { "X": 10, "Y": 20, "Z": 30 }
    }
  ],
  "replacements": [],
  "appends": [
    {
      "p": [0, 2],
      "c": "InputVector3",
      "a": { "label": "Position" },
      "d": { "X": 0, "Y": 0, "Z": 0 }
    }
  ],
  "truncates": [{ "p": [1], "l": 1 }]
}
```

- **p** : Path of the element in the tree
- **c** : Component name
- **a** : Attributes/props
- **d** : Data (The volatile state that is expected to change)
- **n** : Nested (Array of nested nodes)
- **d** : Length (the new length of the nested array)

Update operations are applied first, then replacements, after that the appends and finally the truncations.
