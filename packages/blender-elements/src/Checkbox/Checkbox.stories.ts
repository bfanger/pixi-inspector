import type { Meta } from "@storybook/svelte";
import { faker } from "@faker-js/faker/locale/nl";
import Checkbox from "./Checkbox.svelte";

export default {
  title: "Checkbox",
  component: Checkbox as any,
} as Meta<typeof Checkbox>;

export const Random = {
  args: {
    value: faker.datatype.boolean(),
    hint: faker.lorem.sentence(),
  },
};
