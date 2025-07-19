import type { Meta, StoryObj } from "@storybook/svelte-vite";
import { faker } from "@faker-js/faker/locale/en";
import TextField from "./TextField.svelte";

const meta: Meta<typeof TextField> = {
  title: "Form control / TextField",
  component: TextField,
};
export default meta;

export const Random: StoryObj = {
  args: {
    value: faker.lorem.words({ min: 1, max: 5 }),
  },
};
