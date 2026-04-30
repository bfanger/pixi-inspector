import type { Meta, StoryObj } from "@storybook/svelte-vite";
import ExamplesComponent from "./Examples.svelte";
import { faker } from "@faker-js/faker/locale/en";

const meta: Meta<typeof ExamplesComponent> = {
  title: "Layout / VirtualList",
  component: ExamplesComponent,
};
export default meta;

export const Random: StoryObj = {
  args: {
    total: faker.number.int({ min: 5, max: 25_000 }),
    itemSize: faker.number.int({ min: 16, max: 96 }),
    buffer: faker.number.int({ min: 0, max: 200 }),
  },
};
