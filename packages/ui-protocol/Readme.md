# UI Protocol

Because the UI (in the DevTools panel) has no direct access to the actual objects we need to serialize the UI & events.

One of the most popular remote UI formats is HTML.
HTML serializes to a string, but in javascript JSON is the most performant serialization format.

By using JSON can also use primitive values like numbers, booleans and simple objects and arrays.

## Look & feel

Writing the UI in a xml-like format like JSX would feel familiar.

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

But a considerations is that games run at 60FPS and we don't want to generate the full ui tree on every frame.

Therefore the UI protocols only sends diffs.

## Remote UI diff

```json
{
  "update": [
    {
      "p": [0, 1],
      "d": { "X": 10, "Y": 20, "Z": 30 }
    }
  ],
  "remove": [[0, 2]],
  "insert": [
    {
      "p": [0, 0],
      "c": "InputVector3",
      "a": { "label": "Position" },
      "d": { "X": 0, "Y": 0, "Z": 0 }
    }
  ]
}
```

- **p** : Path of the element in the tree
- **c** : Component name
- **a** : Attributes/props
- **d** : Data (The volatile state that is expected to change)

Update operations are applied first, paths are based on their previous positions, then the removals and finally the inserts.

An insert should not replace an existing element.
