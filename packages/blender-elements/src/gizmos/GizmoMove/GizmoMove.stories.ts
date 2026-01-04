import type { Meta } from "@storybook/svelte-vite";
import { faker } from "@faker-js/faker/locale/en";
import GizmoMove from "./GizmoMove.svelte";

const meta: Meta<typeof GizmoMove> = {
  title: "Gizmo / Move",
  component: GizmoMove,
};
export default meta;

export const Random = {
  args: {
    x: faker.number.int({ min: 10, max: 200 }),
    y: faker.number.int({ min: 50, max: 150 }),
  },
};
