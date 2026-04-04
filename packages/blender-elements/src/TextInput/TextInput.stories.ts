import type { Meta, StoryObj } from "@storybook/svelte-vite";
import { faker } from "@faker-js/faker/locale/en";
import TextInput from "./TextInput.svelte";

const meta: Meta<typeof TextInput> = {
  title: "Form control / TextInput",
  component: TextInput,
};
export default meta;

export const Random: StoryObj = {
  args: {
    value: faker.lorem.words({ min: 1, max: 5 }),
  },
};
