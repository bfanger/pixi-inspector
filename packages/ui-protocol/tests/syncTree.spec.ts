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
              0,
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
              1,
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
              2,
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
                0,
              ],
              "value": true,
            },
            {
              "path": [
                1,
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
                0,
              ],
              "value": false,
            },
            {
              "path": [
                1,
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
                1,
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
                0,
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
            {
              "length": 1,
              "path": [],
            },
          ],
          "value": [
            {
              "path": [
                0,
              ],
              "value": false,
            },
          ],
        }
      `);
  });
});
