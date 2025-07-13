import { describe, it, expect } from "vitest";
import createTestDisplayTree from "./createTestDisplayTree";
import { createSender } from "../src";
import { createTestControllerTree } from "./createTestControllerTree";
import createTestReceiver from "./createTestReceiver";

describe.sequential("sender", () => {
  const displayTree = createTestDisplayTree();
  const [controllerTree, game] = createTestControllerTree();

  const receiver = createTestReceiver(controllerTree);
  const sender = createSender(displayTree, receiver);

  it("sync() created both trees", async () => {
    expect(controllerTree).toMatchInlineSnapshot(`
      {
        "children": [],
        "dispatchEvent": [Function],
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
            "player": {
              "x": 10,
              "y": 0,
            },
            "setData": [Function],
            "sync": [Function],
          },
        ],
        "dispatchEvent": [Function],
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
              "props": {
                "label": "X",
                "step": 1,
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

  it("dispatchEvent() is handled by the receiver", async () => {
    await sender.dispatchEvent(displayTree, "reset");
    expect(controllerTree).toMatchInlineSnapshot(`
      {
        "children": [],
        "dispatchEvent": [Function],
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
