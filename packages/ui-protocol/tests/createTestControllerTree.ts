import refreshNode from "../src/refreshNode";
import { defineRoot } from "../src/svelte/defineRoot";

type Player = { x: number; y: number };
type Game = { player: Player | undefined; replace: number };

export function createTestControllerTree() {
  const game: Game = { player: { x: 10, y: 0 }, replace: 0 };
  let resetLabel = false;
  const previousReplace = game.replace;

  const tree = defineRoot({
    children: [],
    events: {
      reset() {
        tree.children = [];
      },
    },
    sync(patch) {
      const player = game.player;
      if (player && tree.children.length === 0) {
        patch.appends.push(
          {
            component: "NumberInput",
            props: { step: 1 },
            getValue: () => player.x,
            setValue(value) {
              player.x = value;
            },
          },
          {
            component: "Button",
            props: { label: "Add 10" },
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
          refreshNode({ interval: 500, depth: 1 }),
        );
      }
      if (tree.children?.length !== 0) {
        if (!player) {
          patch.truncate = 0;
        } else if (game.replace !== previousReplace) {
          patch.replacements.push({
            index: 0,
            component: "Button",
            props: { label: `Replaced ${game.replace}` },
          });
        }
      }
      return patch;
    },
  });
  return [tree, game] as const;
}
