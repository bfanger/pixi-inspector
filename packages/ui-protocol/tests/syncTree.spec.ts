import { describe, it, expect } from "vitest";
import { syncTree } from "../src/tree-fns";
import { createTestControllerTree } from "./createTestControllerTree";

describe.sequential("syncTree()", () => {
  const [controllerTree, game] = createTestControllerTree();

  it("should append NumberField connected to a PlayerLocationController", () => {
    const patch = syncTree(controllerTree);
    expect(patch).toMatchInlineSnapshot(`
      {
        "appends": [
          {
            "component": "NumberField",
            "events": undefined,
            "path": [
              0,
            ],
            "props": {
              "label": "X",
              "step": 1,
            },
            "setValue": true,
            "value": 10,
          },
          {
            "component": "Button",
            "events": [
              {
                "event": "onclick",
              },
            ],
            "path": [
              1,
            ],
            "props": {
              "label": "Add 10",
            },
            "setValue": undefined,
            "value": undefined,
          },
          {
            "component": "Refresh",
            "events": [
              {
                "event": "refresh",
              },
            ],
            "path": [
              2,
            ],
            "props": {
              "depth": 1,
              "interval": 500,
            },
            "setValue": true,
            "value": undefined,
          },
        ],
        "props": [],
        "replacements": [],
        "truncates": [],
        "value": [],
      }
    `);
  });

  it("should report the current x value", () => {
    expect(syncTree(controllerTree)).toMatchInlineSnapshot(`
      {
        "appends": [],
        "props": [],
        "replacements": [],
        "truncates": [],
        "value": [
          {
            "path": [
              0,
            ],
            "value": 10,
          },
          {
            "path": [
              2,
            ],
            "value": true,
          },
        ],
      }
    `);
    game.player!.x += 5;
    expect(syncTree(controllerTree)).toMatchInlineSnapshot(`
      {
        "appends": [],
        "props": [],
        "replacements": [],
        "truncates": [],
        "value": [
          {
            "path": [
              0,
            ],
            "value": 15,
          },
          {
            "path": [
              2,
            ],
            "value": false,
          },
        ],
      }
    `);
  });

  it("should replace the input with a button", () => {
    game.replace++;
    expect(syncTree(controllerTree)).toMatchInlineSnapshot(`
      {
        "appends": [],
        "props": [],
        "replacements": [
          {
            "component": "Button",
            "events": undefined,
            "path": [
              0,
            ],
            "props": {
              "label": "Replaced 1",
            },
            "setValue": undefined,
            "value": undefined,
          },
        ],
        "truncates": [],
        "value": [
          {
            "path": [
              2,
            ],
            "value": true,
          },
        ],
      }
    `);
  });

  it("should truncate the tree", () => {
    game.player = undefined;
    expect(syncTree(controllerTree)).toMatchInlineSnapshot(`
      {
        "appends": [],
        "props": [],
        "replacements": [],
        "truncates": [
          {
            "length": 0,
            "path": [],
          },
        ],
        "value": [],
      }
    `);
  });
});
