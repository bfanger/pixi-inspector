import type { Meta } from "@storybook/svelte-vite";
import { faker } from "@faker-js/faker/locale/en";
import GizmoRotate from "./GizmoRotate.svelte";

const meta: Meta<typeof GizmoRotate> = {
  title: "Gizmo / Rotate",
  component: GizmoRotate,
};
export default meta;

export const Random = {
  args: {
    value: faker.number.int({ min: 0, max: 360 }),
    x: 300,
    y: 200,
  },
};
