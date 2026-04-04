import type { Meta } from "@storybook/svelte-vite";
import { faker } from "@faker-js/faker/locale/en";
import SearchInput from "./SearchInput.svelte";

const meta: Meta<typeof SearchInput> = {
  title: "Form control / SearchInput",
  component: SearchInput,
};
export default meta;

export const Random = {
  args: {
    value: faker.internet.domainWord(),
  },
};
