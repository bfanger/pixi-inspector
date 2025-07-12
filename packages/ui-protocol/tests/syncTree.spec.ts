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
            "data": 10,
            "path": [
              0,
            ],
            "props": {
              "label": "X",
              "step": 1,
            },
          },
        ],
        "data": [],
        "props": [],
        "replacements": [],
        "truncates": [],
      }
    `);
  });
  it("should report the current x value", () => {
    expect(syncTree(controllerTree)).toMatchInlineSnapshot(`
      {
        "appends": [],
        "data": [
          {
            "path": [
              0,
            ],
            "value": 10,
          },
        ],
        "props": [],
        "replacements": [],
        "truncates": [],
      }
    `);
    game.player!.x += 5;
    expect(syncTree(controllerTree)).toMatchInlineSnapshot(`
      {
        "appends": [],
        "data": [
          {
            "path": [
              0,
            ],
            "value": 15,
          },
        ],
        "props": [],
        "replacements": [],
        "truncates": [],
      }
    `);
  });
  it("should truncate the tree", () => {
    game.player = undefined;
    expect(syncTree(controllerTree)).toMatchInlineSnapshot(`
      {
        "appends": [],
        "data": [],
        "props": [],
        "replacements": [],
        "truncates": [
          {
            "length": 0,
            "path": [],
          },
        ],
      }
    `);
  });
});
