import { describe, it, expect } from "vitest";
import createTestDisplayTree from "./createTestDisplayTree";
import { createTestControllerTree } from "./createTestControllerTree";
import createTestConnection from "./createTestConnection";
import createSender from "../src/createSender";

describe.sequential("sender", () => {
  const displayTree = createTestDisplayTree();
  const [controllerTree, game] = createTestControllerTree();

  const sender = createSender(
    displayTree,
    createTestConnection(controllerTree),
    console.error,
  );

  it("sync() created both trees", async () => {
    expect(controllerTree).toMatchInlineSnapshot(`
      {
        "children": [],
        "events": {
          "reset": [Function],
        },
        "sync": [Function],
      }
    `);
    expect(displayTree).toMatchInlineSnapshot(`
      {
        "children": [],
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
    await sender.sync();
    expect(controllerTree).toMatchInlineSnapshot(`
      {
        "children": [
          {
            "setValue": [Function],
            "sync": [Function],
          },
          {
            "events": {
              "onclick": [Function],
            },
            "sync": [Function],
          },
        ],
        "events": {
          "reset": [Function],
        },
        "sync": [Function],
      }
    `);
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
              "events": undefined,
              "props": {
                "label": "X",
                "step": 1,
              },
              "setValue": true,
              "value": 10,
            },
            "truncate": [Function],
          },
          {
            "children": undefined,
            "path": [
              1,
            ],
            "setChild": [Function],
            "setProps": [Function],
            "setValue": [Function],
            "test": {
              "component": "Button",
              "events": [
                {
                  "event": "onclick",
                },
              ],
              "props": {
                "label": "Add 10",
              },
              "setValue": undefined,
              "value": undefined,
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

  it("setValue() updates the value on the receiver", async () => {
    await sender.setValue(displayTree.children![0], 20);
    expect(game.player?.x).toBe(20);
  });

  it("sync() receives player.x update", async () => {
    game.player!.x += 5;
    await sender.sync();
    expect(displayTree.children?.[0].test.value).toBe(25);
  });

  it("dispatchEvent(onclick) adds 10 and returns patch with updated value", async () => {
    await sender.dispatchEvent(displayTree.children![1], "onclick");
    expect(controllerTree).toMatchInlineSnapshot(`
      {
        "children": [
          {
            "setValue": [Function],
            "sync": [Function],
          },
          {
            "events": {
              "onclick": [Function],
            },
            "sync": [Function],
          },
        ],
        "events": {
          "reset": [Function],
        },
        "sync": [Function],
      }
    `);
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
              "events": undefined,
              "props": {
                "label": "X",
                "step": 1,
              },
              "setValue": true,
              "value": 35,
            },
            "truncate": [Function],
          },
          {
            "children": undefined,
            "path": [
              1,
            ],
            "setChild": [Function],
            "setProps": [Function],
            "setValue": [Function],
            "test": {
              "component": "Button",
              "events": [
                {
                  "event": "onclick",
                },
              ],
              "props": {
                "label": "Add 10",
              },
              "setValue": undefined,
              "value": undefined,
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

  it("updating the replace counter, will replace the input with a button", async () => {
    game.replace = 123;
    await sender.sync();
    expect(controllerTree).toMatchInlineSnapshot(`
      {
        "children": [
          {},
          {
            "events": {
              "onclick": [Function],
            },
            "sync": [Function],
          },
        ],
        "events": {
          "reset": [Function],
        },
        "sync": [Function],
      }
    `);
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
              "component": "Button",
              "events": undefined,
              "props": {
                "label": "Replaced 123",
              },
              "setValue": undefined,
              "value": undefined,
            },
            "truncate": [Function],
          },
          {
            "children": undefined,
            "path": [
              1,
            ],
            "setChild": [Function],
            "setProps": [Function],
            "setValue": [Function],
            "test": {
              "component": "Button",
              "events": [
                {
                  "event": "onclick",
                },
              ],
              "props": {
                "label": "Add 10",
              },
              "setValue": undefined,
              "value": undefined,
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

  it("reset() removes all child nodes from both trees & resyncs", async () => {
    const controllerBefore = controllerTree.children?.[0];
    const displayBefore = displayTree.children?.[0];
    expect(controllerBefore).toBeDefined();
    expect(displayBefore).toBeDefined();

    await sender.reset();

    const controllerAfter = controllerTree.children?.[0];
    const displayAfter = displayTree.children?.[0];
    expect(controllerAfter).toBeDefined();
    expect(displayAfter).toBeDefined();
    expect(controllerAfter).not.toBe(controllerBefore);
    expect(displayAfter).not.toBe(displayBefore);
  });
});
