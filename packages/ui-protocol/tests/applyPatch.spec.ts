import { describe, it, expect } from "vitest";
import { applyPatch } from "../src/tree-fns";
import createTestDisplayTree from "./createTestDisplayTree";

describe.sequential("applyPatch()", () => {
  const displayTree = createTestDisplayTree();

  it("should append", () => {
    applyPatch(displayTree, {
      value: [],
      props: [],
      replacements: [],
      truncates: [],
      appends: [
        {
          path: [{ slot: "children", index: 0 }],
          component: "TextInput",
          props: {},
          value: "Hello world",
          events: [{ event: "oninput" }],
        },
      ],
      errors: [],
    });
    expect(displayTree).toMatchInlineSnapshot(`
      {
        "createNode": [Function],
        "path": [],
        "setProps": [Function],
        "setValue": [Function],
        "slots": {
          "children": [
            {
              "createNode": [Function],
              "path": [
                {
                  "index": 0,
                  "slot": "children",
                },
              ],
              "setProps": [Function],
              "setValue": [Function],
              "test": {
                "component": "TextInput",
                "events": [
                  {
                    "event": "oninput",
                  },
                ],
                "props": {},
                "value": "Hello world",
              },
              "truncate": [Function],
            },
          ],
        },
        "test": {
          "component": "Fragment",
          "props": {},
          "value": null,
        },
        "truncate": [Function],
      }
    `);
  });
  it("should replace and nested append", () => {
    applyPatch(displayTree, {
      value: [],
      props: [],
      replacements: [
        {
          path: [{ slot: "children", index: 0 }],
          component: "NumberInput",
          props: {},
          value: 0,
        },
      ],
      appends: [
        {
          path: [{ slot: "children", index: 1 }],
          component: "Fragment",
          props: {},
          value: null,
          slots: {
            children: [
              {
                path: [
                  { slot: "children", index: 1 },
                  { slot: "children", index: 0 },
                ],
                component: "TextInput",
                props: {},
                value: "input 1",
              },
              {
                path: [
                  { slot: "children", index: 1 },
                  { slot: "children", index: 1 },
                ],
                component: "TextInput",
                props: {},
                value: "input 2",
              },
            ],
          },
        },
      ],
      truncates: [],
      errors: [],
    });
    expect(displayTree).toMatchInlineSnapshot(`
      {
        "createNode": [Function],
        "path": [],
        "setProps": [Function],
        "setValue": [Function],
        "slots": {
          "children": [
            {
              "createNode": [Function],
              "path": [
                {
                  "index": 0,
                  "slot": "children",
                },
              ],
              "setProps": [Function],
              "setValue": [Function],
              "test": {
                "component": "NumberInput",
                "props": {},
                "value": 0,
              },
              "truncate": [Function],
            },
            {
              "createNode": [Function],
              "path": [
                {
                  "index": 1,
                  "slot": "children",
                },
              ],
              "setProps": [Function],
              "setValue": [Function],
              "slots": {
                "children": [
                  {
                    "createNode": [Function],
                    "path": [
                      {
                        "index": 1,
                        "slot": "children",
                      },
                      {
                        "index": 0,
                        "slot": "children",
                      },
                    ],
                    "setProps": [Function],
                    "setValue": [Function],
                    "test": {
                      "component": "TextInput",
                      "props": {},
                      "value": "input 1",
                    },
                    "truncate": [Function],
                  },
                  {
                    "createNode": [Function],
                    "path": [
                      {
                        "index": 1,
                        "slot": "children",
                      },
                      {
                        "index": 1,
                        "slot": "children",
                      },
                    ],
                    "setProps": [Function],
                    "setValue": [Function],
                    "test": {
                      "component": "TextInput",
                      "props": {},
                      "value": "input 2",
                    },
                    "truncate": [Function],
                  },
                ],
              },
              "test": {
                "component": "Fragment",
                "props": {},
                "value": null,
              },
              "truncate": [Function],
            },
          ],
        },
        "test": {
          "component": "Fragment",
          "props": {},
          "value": null,
        },
        "truncate": [Function],
      }
    `);
  });
  it("should update props & data and truncate", () => {
    applyPatch(displayTree, {
      props: [{ path: [{ slot: "children", index: 0 }], values: { step: 10 } }],
      value: [{ path: [{ slot: "children", index: 0 }], value: 50 }],
      replacements: [],
      appends: [],
      truncates: [{ path: [], slot: "children", length: 1 }],
      errors: [],
    });
    expect(displayTree).toMatchInlineSnapshot(`
      {
        "createNode": [Function],
        "path": [],
        "setProps": [Function],
        "setValue": [Function],
        "slots": {
          "children": [
            {
              "createNode": [Function],
              "path": [
                {
                  "index": 0,
                  "slot": "children",
                },
              ],
              "setProps": [Function],
              "setValue": [Function],
              "test": {
                "component": "NumberInput",
                "props": {
                  "step": 10,
                },
                "value": 50,
              },
              "truncate": [Function],
            },
          ],
        },
        "test": {
          "component": "Fragment",
          "props": {},
          "value": null,
        },
        "truncate": [Function],
      }
    `);
  });
  it("should truncate with null should remove the slot", () => {
    applyPatch(displayTree, {
      props: [],
      value: [],
      replacements: [],
      appends: [],
      truncates: [{ path: [], slot: "children", length: null }],
      errors: [],
    });
    expect((displayTree as any).slots.children).toBeUndefined();
  });
  it("should append to create a slot when it doesn't exist", () => {
    // After the previous test, the "children" slot is removed.
    // Appending should create a new slot.
    applyPatch(displayTree, {
      value: [],
      props: [],
      replacements: [],
      truncates: [],
      appends: [
        {
          path: [{ slot: "newSlot", index: 0 }],
          component: "TextInput",
          props: {},
          value: "created",
        },
      ],
      errors: [],
    });
    expect(displayTree.slots!.newSlot).toBeDefined();
    expect(displayTree.slots!.newSlot.length).toBe(1);
    expect(displayTree.slots!.newSlot[0].test.component).toBe("TextInput");
    expect(displayTree.slots!.newSlot[0].test.value).toBe("created");
  });
});
