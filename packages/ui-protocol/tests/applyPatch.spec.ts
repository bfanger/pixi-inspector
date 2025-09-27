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
          path: [0],
          component: "TextInput",
          props: {},
          value: "Hello world",
          events: [{ event: "oninput" }],
        },
      ],
    });
    expect(displayTree).toMatchInlineSnapshot(`
      {
        "children": [
          {
            "children": undefined,
            "path": [
              0,
            ],
            "setChild": [Function],
            "setProps": [Function],
            "setValue": [Function],
            "test": {
              "component": "TextInput",
              "events": [
                "oninput",
              ],
              "props": {},
              "value": "Hello world",
            },
            "truncate": [Function],
          },
        ],
        "path": [],
        "setChild": [Function],
        "setProps": [Function],
        "setValue": [Function],
        "test": {
          "component": "Container",
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
        { path: [0], component: "NumberField", props: {}, value: 0 },
      ],
      appends: [
        {
          path: [1],
          component: "Container",
          props: {},
          value: null,
          children: [
            {
              path: [1, 0],
              component: "TextInput",
              props: {},
              value: "input 1",
            },
            {
              path: [1, 1],
              component: "TextInput",
              props: {},
              value: "input 2",
            },
          ],
        },
      ],
      truncates: [],
    });
    expect(displayTree).toMatchInlineSnapshot(`
      {
        "children": [
          {
            "children": undefined,
            "path": [
              0,
            ],
            "setChild": [Function],
            "setProps": [Function],
            "setValue": [Function],
            "test": {
              "component": "NumberField",
              "props": {},
              "value": 0,
            },
            "truncate": [Function],
          },
          {
            "children": [
              {
                "children": undefined,
                "path": [
                  1,
                  0,
                ],
                "setChild": [Function],
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
                "children": undefined,
                "path": [
                  1,
                  1,
                ],
                "setChild": [Function],
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
            "path": [
              1,
            ],
            "setChild": [Function],
            "setProps": [Function],
            "setValue": [Function],
            "test": {
              "component": "Container",
              "props": {},
              "value": null,
            },
            "truncate": [Function],
          },
        ],
        "path": [],
        "setChild": [Function],
        "setProps": [Function],
        "setValue": [Function],
        "test": {
          "component": "Container",
          "props": {},
          "value": null,
        },
        "truncate": [Function],
      }
    `);
  });
  it("should update props & data and truncate", () => {
    applyPatch(displayTree, {
      props: [{ path: [0], values: { step: 10 } }],
      value: [{ path: [0], value: 50 }],
      replacements: [],
      appends: [],
      truncates: [{ path: [], length: 1 }],
    });
    expect(displayTree).toMatchInlineSnapshot(`
      {
        "children": [
          {
            "children": undefined,
            "path": [
              0,
            ],
            "setChild": [Function],
            "setProps": [Function],
            "setValue": [Function],
            "test": {
              "component": "NumberField",
              "props": {
                "step": 10,
              },
              "value": 50,
            },
            "truncate": [Function],
          },
        ],
        "path": [],
        "setChild": [Function],
        "setProps": [Function],
        "setValue": [Function],
        "test": {
          "component": "Container",
          "props": {},
          "value": null,
        },
        "truncate": [Function],
      }
    `);
  });
});
