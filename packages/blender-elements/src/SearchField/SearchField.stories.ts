import type { Meta } from "@storybook/svelte-vite";
import { faker } from "@faker-js/faker/locale/en";
import SearchField from "./SearchField.svelte";

const meta: Meta<typeof SearchField> = {
  title: "Form control / SearchField",
  component: SearchField,
};
export default meta;

export const Random = {
  args: {
    value: faker.internet.domainWord(),
  },
};
