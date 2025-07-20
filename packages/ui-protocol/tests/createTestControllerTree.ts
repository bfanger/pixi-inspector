import type { TreeControllerNode } from "../src/types";

type Player = { x: number; y: number };
type Game = { player: Player | undefined };

export function createTestControllerTree() {
  const game: Game = { player: { x: 10, y: 0 } };
  let resetLabel = false;

  const tree: TreeControllerNode = {
    children: [],
    events: {
      reset() {
        tree.children = [];
      },
    },
    sync(patch) {
      const player = game.player;
      if (player && tree.children!.length === 0) {
        patch.appends.push(
          {
            component: "NumberField",
            props: { label: "X", step: 1 },
            value: player.x,
            node: {
              sync(patch) {
                patch.value = player.x;
              },
              setValue(value) {
                player.x = value as number;
              },
            },
          },
          {
            component: "Button",
            props: { label: "Add 10" },
            node: {
              sync(patch) {
                if (player.x >= 100 && !resetLabel) {
                  patch.props = { label: "Reset" };
                  resetLabel = true;
                } else if (player.x < 100 && resetLabel) {
                  patch.props = { label: "Add 10" };
                  resetLabel = false;
                }
              },
              events: {
                onclick() {
                  if (player.x >= 100) {
                    player.x = 0;
                  } else {
                    player.x += 10;
                  }
                  return 1;
                },
              },
            },
          },
        );
      }
      if (!player && tree.children?.length !== 0) {
        patch.truncate = 0;
      }
      return patch;
    },
  };
  return [tree, game] as const;
}
