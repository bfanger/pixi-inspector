import { describe, it, expect } from "vitest";
import { applyPatch } from "./tree-fns";
import createTestTree from "./createTestTree";

describe.sequential("applyPatch()", () => {
  const tree = createTestTree();

  it("should append", () => {
    applyPatch(tree, {
      data: [],
      props: [],
      replacements: [],
      truncates: [],
      appends: [
        {
          path: [0],
          component: "TextInput",
          props: {},
          data: "Hello world",
        },
      ],
    });
    expect(tree).toMatchInlineSnapshot(`
      {
        "children": [
          {
            "children": undefined,
            "setChild": [Function],
            "setData": [Function],
            "setProps": [Function],
            "test": {
              "component": "TextInput",
              "data": "Hello world",
              "path": [
                0,
              ],
              "props": {},
            },
            "truncate": [Function],
          },
        ],
        "setChild": [Function],
        "setData": [Function],
        "setProps": [Function],
        "test": {
          "component": "Container",
          "data": null,
          "path": [],
          "props": {},
        },
        "truncate": [Function],
      }
    `);
  });
  it("should replace and nested append", () => {
    applyPatch(tree, {
      data: [],
      props: [],
      replacements: [
        { path: [0], component: "NumberInput", props: {}, data: 0 },
      ],
      appends: [
        {
          path: [1],
          component: "Container",
          props: {},
          data: null,
          children: [
            {
              path: [1, 0],
              component: "TextInput",
              props: {},
              data: "input 1",
            },
            {
              path: [1, 1],
              component: "TextInput",
              props: {},
              data: "input 2",
            },
          ],
        },
      ],
      truncates: [],
    });
    expect(tree).toMatchInlineSnapshot(`
      {
        "children": [
          {
            "children": undefined,
            "setChild": [Function],
            "setData": [Function],
            "setProps": [Function],
            "test": {
              "component": "NumberInput",
              "data": 0,
              "path": [
                0,
              ],
              "props": {},
            },
            "truncate": [Function],
          },
          {
            "children": [
              {
                "children": undefined,
                "setChild": [Function],
                "setData": [Function],
                "setProps": [Function],
                "test": {
                  "component": "TextInput",
                  "data": "input 1",
                  "path": [
                    1,
                    0,
                  ],
                  "props": {},
                },
                "truncate": [Function],
              },
              {
                "children": undefined,
                "setChild": [Function],
                "setData": [Function],
                "setProps": [Function],
                "test": {
                  "component": "TextInput",
                  "data": "input 2",
                  "path": [
                    1,
                    1,
                  ],
                  "props": {},
                },
                "truncate": [Function],
              },
            ],
            "setChild": [Function],
            "setData": [Function],
            "setProps": [Function],
            "test": {
              "component": "Container",
              "data": null,
              "path": [
                1,
              ],
              "props": {},
            },
            "truncate": [Function],
          },
        ],
        "setChild": [Function],
        "setData": [Function],
        "setProps": [Function],
        "test": {
          "component": "Container",
          "data": null,
          "path": [],
          "props": {},
        },
        "truncate": [Function],
      }
    `);
  });
  it("should update props & data and truncate", () => {
    applyPatch(tree, {
      props: [{ path: [0], props: { step: 10 } }],
      data: [{ path: [0], data: 50 }],
      replacements: [],
      appends: [],
      truncates: [{ path: [], length: 1 }],
    });
    expect(tree).toMatchInlineSnapshot(`
      {
        "children": [
          {
            "children": undefined,
            "setChild": [Function],
            "setData": [Function],
            "setProps": [Function],
            "test": {
              "component": "NumberInput",
              "data": 50,
              "path": [
                0,
              ],
              "props": {
                "step": 10,
              },
            },
            "truncate": [Function],
          },
        ],
        "setChild": [Function],
        "setData": [Function],
        "setProps": [Function],
        "test": {
          "component": "Container",
          "data": null,
          "path": [],
          "props": {},
        },
        "truncate": [Function],
      }
    `);
  });
});
