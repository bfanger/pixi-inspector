import type { TreeControllerNode } from "../src/types";

type Player = { x: number; y: number };
type Game = { player: Player | undefined };

export function createTestControllerTree() {
  const game: Game = { player: { x: 10, y: 0 } };
  let resetting = false;

  const tree: TreeControllerNode = {
    children: [],
    events: {
      reset() {
        resetting = true;
      },
    },
    sync(patch) {
      if (resetting) {
        resetting = false;
        if (tree.children!.length > 0) {
          patch.truncate = 0;
        }
        return;
      }
      const player = game.player;
      if (player && tree.children!.length === 0) {
        patch.appends.push(
          {
            component: "NumberField",
            props: { label: "X", step: 1 },
            data: player.x,
            node: {
              sync(patch) {
                patch.data = player.x;
              },
              setData(value) {
                player.x = value as number;
              },
            },
          },
          {
            component: "Button",
            props: { label: "Add 10" },
            node: {
              events: {
                onclick() {
                  player.x += 10;
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
