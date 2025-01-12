import type { TreeControllerNode } from "../src/types";

type Player = { x: number; y: number };
type Game = { player: Player | undefined };
type TestPlayerController = TreeControllerNode & { player: Player };

export function createTestControllerTree() {
  const game: Game = { player: { x: 10, y: 0 } };

  const tree: TreeControllerNode = {
    children: [],
    dispatchEvent(event, patch) {
      if (event.type === "reset") {
        patch.truncate = 0;
      }
    },
    sync(patch) {
      const player = game.player;
      if (player && this.children!.length === 0) {
        const node: TestPlayerController = {
          player,
          sync(patch) {
            patch.data = this.player.x;
          },
          setData(value: number) {
            this.player.x = value;
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
  return [tree, game] as const;
}
