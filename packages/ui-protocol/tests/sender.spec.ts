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
    await sender.sync();
    expect(controllerTree).toMatchInlineSnapshot(`
      {
        "children": [
          {
            "setData": [Function],
            "sync": [Function],
          },
          {
            "events": {
              "onclick": [Function],
            },
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
            "setData": [Function],
            "setProps": [Function],
            "test": {
              "component": "NumberField",
              "data": 10,
              "events": undefined,
              "props": {
                "label": "X",
                "step": 1,
              },
            },
            "truncate": [Function],
          },
          {
            "children": undefined,
            "path": [
              1,
            ],
            "setChild": [Function],
            "setData": [Function],
            "setProps": [Function],
            "test": {
              "component": "Button",
              "data": undefined,
              "events": [
                "onclick",
              ],
              "props": {
                "label": "Add 10",
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

  it("setData() updates the value on the receiver", async () => {
    await sender.setData(displayTree.children![0], 20);
    expect(game.player?.x).toBe(20);
  });

  it("sync() receives player.x update", async () => {
    game.player!.x += 5;
    await sender.sync();
    expect(displayTree.children?.[0].test.data).toBe(25);
  });

  it("dispatchEvent(onclick) adds 10 and returns patch with updated value", async () => {
    await sender.dispatchEvent(displayTree.children![1], "onclick");
    expect(controllerTree).toMatchInlineSnapshot(`
      {
        "children": [
          {
            "setData": [Function],
            "sync": [Function],
          },
          {
            "events": {
              "onclick": [Function],
            },
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
            "setData": [Function],
            "setProps": [Function],
            "test": {
              "component": "NumberField",
              "data": 35,
              "events": undefined,
              "props": {
                "label": "X",
                "step": 1,
              },
            },
            "truncate": [Function],
          },
          {
            "children": undefined,
            "path": [
              1,
            ],
            "setChild": [Function],
            "setData": [Function],
            "setProps": [Function],
            "test": {
              "component": "Button",
              "data": undefined,
              "events": [
                "onclick",
              ],
              "props": {
                "label": "Add 10",
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

  it("dispatchEvent(reset) removes all child nodes", async () => {
    await sender.dispatchEvent(displayTree, "reset");
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
