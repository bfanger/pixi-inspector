import { describe, it, expect } from "vitest";
import createTestDisplayTree from "./createTestDisplayTree";
import { createReceiver, createSender } from "../src/";
import { createTestControllerTree } from "./createTestControllerTree";

describe("bridge", () => {
  const displayTree = createTestDisplayTree();
  const [controllerTree, game] = createTestControllerTree();

  const receiver = createReceiver(controllerTree);
  const sender = createSender(displayTree, {
    update: (data, event) => Promise.resolve(receiver.update(data, event)),
    sync: (data, path) => Promise.resolve(receiver.sync(data, path)),
  });
  const dispatchRootEvent = sender.createDispatcher(displayTree);

  it("should sync", async () => {
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
  it("should setData", async () => {
    await sender.setData(displayTree.children![0], 20);
    expect(game.player?.x).toBe(20);
  });
  it("should sync", async () => {
    game.player!.x += 5;
    await sender.sync();
    expect(displayTree.children?.[0].test.data).toBe(25);
  });
  it("should handle events", async () => {
    await dispatchRootEvent("reset");
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
