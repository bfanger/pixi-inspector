import { describe, it, expect } from "vitest";
import { TreeControllerNode } from "./types";
import { syncTree } from "./tree-fns";

describe.sequential("syncTree()", () => {
  type Player = { x: number };
  type TestPlayerController = TreeControllerNode & { player: Player };

  const player: Player | undefined = { x: 10 };
  const app: TreeControllerNode = {
    children: [],
    sync(patch) {
      if (player && this.children!.length === 0) {
        const node: TestPlayerController = {
          player,
          sync(patch) {
            patch.data = this.player.x;
          },
        };
        patch.appends.push({
          component: "NumberInput",
          props: { label: "X" },
          data: player.x,
          node,
        });
      }
      if (!player && this.children?.length === 1) {
        patch.truncate = 0;
      }
      return patch;
    },
  };
  it("should append NumberInput connected to a PlayerLocationController", () => {
    const patch = syncTree(app);
    expect(patch).toMatchInlineSnapshot(`
      {
        "appends": [
          {
            "component": "NumberInput",
            "data": 10,
            "path": [
              0,
            ],
            "props": {
              "label": "X",
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
    const patch = syncTree(app);
    expect(patch).toMatchInlineSnapshot(`
      {
        "appends": [],
        "data": [
          {
            "data": 10,
            "path": [
              0,
            ],
          },
        ],
        "props": [],
        "replacements": [],
        "truncates": [],
      }
    `);
    player.x += 5;
    expect(patch).toMatchInlineSnapshot(`
      {
        "appends": [],
        "data": [
          {
            "data": 10,
            "path": [
              0,
            ],
          },
        ],
        "props": [],
        "replacements": [],
        "truncates": [],
      }
    `);
  });
  it("should truncate the tree", () => {});
});
