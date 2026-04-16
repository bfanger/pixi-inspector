import { describe, it, expect } from "vitest";
import { applyValues, syncTree } from "../src/tree-fns";
import { createTestControllerTree } from "./createTestControllerTree";

describe.sequential("syncTree()", () => {
  const [controllerTree, game] = createTestControllerTree();

  it("should append NumberInput connected to a PlayerLocationController", () => {
    const patch = syncTree(controllerTree, [], applyValues(controllerTree, []));
    expect(patch).toMatchInlineSnapshot(`
      {
        "appends": [
          {
            "component": "Refresh",
            "events": [
              {
                "event": "refresh",
              },
            ],
            "path": [
              {
                "index": 0,
                "slot": "children",
              },
            ],
            "props": {
              "depth": 1,
              "interval": 500,
            },
            "setValue": undefined,
            "value": false,
          },
          {
            "component": "NumberInput",
            "events": undefined,
            "path": [
              {
                "index": 1,
                "slot": "children",
              },
            ],
            "props": {
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
              {
                "index": 2,
                "slot": "children",
              },
            ],
            "props": {
              "label": "Add 10",
            },
            "setValue": undefined,
            "value": undefined,
          },
        ],
        "errors": [],
        "props": [],
        "replacements": [],
        "truncates": [],
        "value": [],
      }
    `);
  });

  it("should report the current x value", () => {
    expect(syncTree(controllerTree, [], applyValues(controllerTree, [])))
      .toMatchInlineSnapshot(`
        {
          "appends": [],
          "errors": [],
          "props": [],
          "replacements": [],
          "truncates": [],
          "value": [
            {
              "path": [
                {
                  "index": 0,
                  "slot": "children",
                },
              ],
              "value": true,
            },
            {
              "path": [
                {
                  "index": 1,
                  "slot": "children",
                },
              ],
              "value": 10,
            },
          ],
        }
      `);
    game.player!.x += 5;
    expect(syncTree(controllerTree, [], applyValues(controllerTree, [])))
      .toMatchInlineSnapshot(`
        {
          "appends": [],
          "errors": [],
          "props": [],
          "replacements": [],
          "truncates": [],
          "value": [
            {
              "path": [
                {
                  "index": 0,
                  "slot": "children",
                },
              ],
              "value": false,
            },
            {
              "path": [
                {
                  "index": 1,
                  "slot": "children",
                },
              ],
              "value": 15,
            },
          ],
        }
      `);
  });

  it("should replace the input with a button", () => {
    game.replace++;
    expect(syncTree(controllerTree, [], applyValues(controllerTree, [])))
      .toMatchInlineSnapshot(`
        {
          "appends": [],
          "errors": [],
          "props": [],
          "replacements": [
            {
              "component": "Button",
              "events": undefined,
              "path": [
                {
                  "index": 1,
                  "slot": "children",
                },
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
                {
                  "index": 0,
                  "slot": "children",
                },
              ],
              "value": true,
            },
          ],
        }
      `);
  });

  it("should truncate the tree", () => {
    game.player = undefined;
    expect(syncTree(controllerTree, [], applyValues(controllerTree, [])))
      .toMatchInlineSnapshot(`
        {
          "appends": [],
          "errors": [],
          "props": [],
          "replacements": [],
          "truncates": [
            [
              {
                "index": 1,
                "slot": "children",
              },
            ],
          ],
          "value": [
            {
              "path": [
                {
                  "index": 0,
                  "slot": "children",
                },
              ],
              "value": false,
            },
          ],
        }
      `);
  });
});
