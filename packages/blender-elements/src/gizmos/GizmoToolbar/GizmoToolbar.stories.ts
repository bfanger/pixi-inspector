import type { Meta, StoryObj } from "@storybook/svelte-vite";
import { faker } from "@faker-js/faker/locale/en";
import { fn } from "storybook/test";
import GizmoToolbar from "./GizmoToolbar.svelte";
const tools = ["translate", ""];
const meta: Meta<typeof GizmoToolbar> = {
  title: "Gizmo / Toolbar",
  component: GizmoToolbar,
  args: {
    setValue: fn(),
  },
  argTypes: {
    value: {
      control: { type: "select" },
      options: tools,
    },
  },
};

export default meta;

export const Random: StoryObj = {
  args: {
    value: faker.helpers.arrayElement(tools),
  },
};
