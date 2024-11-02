import type { Meta } from "@storybook/svelte";
import { faker } from "@faker-js/faker/locale/nl";
import SearchField from "./SearchField.svelte";

export default {
  title: "SearchField",
  component: SearchField as any,
} as Meta<typeof SearchField>;

export const Random = {
  args: {
    value: faker.internet.domainWord(),
  },
};
