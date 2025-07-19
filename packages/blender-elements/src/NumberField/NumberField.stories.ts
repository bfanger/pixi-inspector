import type { Meta, StoryObj } from "@storybook/svelte-vite";
import { faker } from "@faker-js/faker/locale/en";
import NumberField from "./NumberField.svelte";

const meta: Meta<typeof NumberField> = {
  title: "Form control / NumberField",
  component: NumberField,
};
export default meta;

export const Random: StoryObj = {
  args: {
    value: faker.number.int({ min: 10, max: 1000 }),
    min: faker.datatype.boolean()
      ? faker.number.int({ min: -100, max: 10 })
      : undefined,
    max: faker.datatype.boolean()
      ? faker.number.int({ min: 10, max: 10_000 })
      : undefined,
    suffix: faker.datatype.boolean() ? faker.science.unit().symbol : undefined,
    hint: faker.lorem.sentence(),
    step: faker.helpers.arrayElement([0.001, 0.01, 0.1, 1, 10]),
    location: faker.helpers.arrayElement(["alone", "top", "middle", "bottom"]),
  },
};
