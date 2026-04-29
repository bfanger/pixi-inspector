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

  it("reset() populates both trees", async () => {
    expect(controllerTree).toMatchInlineSnapshot(`
      {
        "events": {
          "reset": [Function],
        },
        "slots": {
          "children": [],
        },
        "sync": [Function],
      }
    `);
    expect(displayTree).toMatchInlineSnapshot(`
      {
        "createNode": [Function],
        "path": [],
        "setProps": [Function],
        "setValue": [Function],
        "slots": {
          "children": [],
        },
        "test": {
          "component": "Fragment",
          "props": {},
          "value": null,
        },
        "truncate": [Function],
      }
    `);
    await sender.reset();
    expect(controllerTree).toMatchInlineSnapshot(`
      {
        "events": {
          "reset": [Function],
        },
        "slots": {
          "children": [
            {
              "events": {
                "refresh": [Function],
              },
              "sync": [Function],
            },
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
        },
        "sync": [Function],
      }
    `);
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
                "component": "Refresh",
                "events": [
                  {
                    "event": "refresh",
                  },
                ],
                "props": {
                  "depth": 1,
                  "interval": 500,
                },
                "setValue": undefined,
                "value": false,
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
              "test": {
                "component": "NumberInput",
                "events": undefined,
                "props": {
                  "step": 1,
                },
                "setValue": true,
                "value": 10,
              },
              "truncate": [Function],
            },
            {
              "createNode": [Function],
              "path": [
                {
                  "index": 2,
                  "slot": "children",
                },
              ],
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

  it("setValue() updates the value on the receiver", async () => {
    await sender.setValue(displayTree.slots!.children![1], 20);
    expect(game.player?.x).toBe(20);
  });

  it("sync() receives player.x update", async () => {
    game.player!.x += 5;
    await sender.dispatchEvent(displayTree, "refresh");
    expect(displayTree.slots?.children?.[1].test.value).toBe(25);
  });

  it("dispatchEvent(onclick) adds 10 and returns patch with updated value", async () => {
    await sender.dispatchEvent(displayTree.slots!.children![1], "onclick");
    expect(controllerTree).toMatchInlineSnapshot(`
      {
        "events": {
          "reset": [Function],
        },
        "slots": {
          "children": [
            {
              "events": {
                "refresh": [Function],
              },
              "sync": [Function],
            },
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
        },
        "sync": [Function],
      }
    `);
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
                "component": "Refresh",
                "events": [
                  {
                    "event": "refresh",
                  },
                ],
                "props": {
                  "depth": 1,
                  "interval": 500,
                },
                "setValue": undefined,
                "value": true,
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
              "test": {
                "component": "NumberInput",
                "events": undefined,
                "props": {
                  "step": 1,
                },
                "setValue": true,
                "value": 25,
              },
              "truncate": [Function],
            },
            {
              "createNode": [Function],
              "path": [
                {
                  "index": 2,
                  "slot": "children",
                },
              ],
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

  it("updating the replace counter, will replace the input with a button", async () => {
    game.replace = 123;
    await sender.dispatchEvent(displayTree, "refresh");
    expect(controllerTree).toMatchInlineSnapshot(`
      {
        "events": {
          "reset": [Function],
        },
        "slots": {
          "children": [
            {
              "events": {
                "refresh": [Function],
              },
              "sync": [Function],
            },
            {},
            {
              "events": {
                "onclick": [Function],
              },
              "sync": [Function],
            },
          ],
        },
        "sync": [Function],
      }
    `);
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
                "component": "Refresh",
                "events": [
                  {
                    "event": "refresh",
                  },
                ],
                "props": {
                  "depth": 1,
                  "interval": 500,
                },
                "setValue": undefined,
                "value": false,
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
              "createNode": [Function],
              "path": [
                {
                  "index": 2,
                  "slot": "children",
                },
              ],
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

  it("reset() removes all child nodes from both trees & resyncs", async () => {
    const controllerBefore = controllerTree.slots!.children[0];
    const displayBefore = displayTree.slots?.children?.[0];
    expect(controllerBefore).toBeDefined();
    expect(displayBefore).toBeDefined();

    await sender.reset();

    const controllerAfter = controllerTree.slots!.children[0];
    const displayAfter = displayTree.slots?.children?.[0];
    expect(controllerAfter).toBeDefined();
    expect(displayAfter).toBeDefined();
    expect(controllerAfter).not.toBe(controllerBefore);
    expect(displayAfter).not.toBe(displayBefore);
  });
});
