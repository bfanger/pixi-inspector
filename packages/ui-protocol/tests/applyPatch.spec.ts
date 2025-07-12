import { describe, it, expect } from "vitest";
import { applyPatch } from "../src/tree-fns";
import createTestDisplayTree from "./createTestDisplayTree";

describe.sequential("applyPatch()", () => {
  const displayTree = createTestDisplayTree();

  it("should append", () => {
    applyPatch(displayTree, {
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
    expect(displayTree).toMatchInlineSnapshot(`
      {
        "children": [
          {
            "children": undefined,
            "path": [
              0,
            ],
            "setChild": [Function],
            "setData": [Function],
            "setProps": [Function],
            "test": {
              "component": "TextInput",
              "data": "Hello world",
              "props": {},
            },
            "truncate": [Function],
          },
        ],
        "path": [],
        "setChild": [Function],
        "setData": [Function],
        "setProps": [Function],
        "test": {
          "component": "Container",
          "data": null,
          "props": {},
        },
        "truncate": [Function],
      }
    `);
  });
  it("should replace and nested append", () => {
    applyPatch(displayTree, {
      data: [],
      props: [],
      replacements: [
        { path: [0], component: "NumberField", props: {}, data: 0 },
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
    expect(displayTree).toMatchInlineSnapshot(`
      {
        "children": [
          {
            "children": undefined,
            "path": [
              0,
            ],
            "setChild": [Function],
            "setData": [Function],
            "setProps": [Function],
            "test": {
              "component": "NumberField",
              "data": 0,
              "props": {},
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
                "setData": [Function],
                "setProps": [Function],
                "test": {
                  "component": "TextInput",
                  "data": "input 1",
                  "props": {},
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
                "setData": [Function],
                "setProps": [Function],
                "test": {
                  "component": "TextInput",
                  "data": "input 2",
                  "props": {},
                },
                "truncate": [Function],
              },
            ],
            "path": [
              1,
            ],
            "setChild": [Function],
            "setData": [Function],
            "setProps": [Function],
            "test": {
              "component": "Container",
              "data": null,
              "props": {},
            },
            "truncate": [Function],
          },
        ],
        "path": [],
        "setChild": [Function],
        "setData": [Function],
        "setProps": [Function],
        "test": {
          "component": "Container",
          "data": null,
          "props": {},
        },
        "truncate": [Function],
      }
    `);
  });
  it("should update props & data and truncate", () => {
    applyPatch(displayTree, {
      props: [{ path: [0], values: { step: 10 } }],
      data: [{ path: [0], value: 50 }],
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
            "setData": [Function],
            "setProps": [Function],
            "test": {
              "component": "NumberField",
              "data": 50,
              "props": {
                "step": 10,
              },
            },
            "truncate": [Function],
          },
        ],
        "path": [],
        "setChild": [Function],
        "setData": [Function],
        "setProps": [Function],
        "test": {
          "component": "Container",
          "data": null,
          "props": {},
        },
        "truncate": [Function],
      }
    `);
  });
});
