import type { Meta } from "@storybook/svelte";
import { faker } from "@faker-js/faker/locale/nl";
import NumberField from "./NumberField.svelte";

export default {
  title: "NumberField",
  component: NumberField as any,
} as Meta<typeof NumberField>;

export const Random = {
  args: {
    value: faker.number.int(1000),
    suffix: faker.datatype.boolean() ? faker.science.unit().symbol : undefined,
    // hint: faker.lorem.sentence(),
  },
};
