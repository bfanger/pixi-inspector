import type { Meta } from "@storybook/svelte-vite";
import { faker } from "@faker-js/faker/locale/en";
import Warning from "./Warning.svelte";

const meta: Meta<typeof Warning> = {
  title: "Notifications / Warning",
  component: Warning,
};
export default meta;

export const Random = {
  args: {
    message: faker.lorem.sentence(),
  },
};
