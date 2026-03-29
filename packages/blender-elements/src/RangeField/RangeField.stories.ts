import type { Meta, StoryObj } from "@storybook/svelte-vite";
import { faker } from "@faker-js/faker/locale/en";
import RangeField from "./RangeField.svelte";

const meta: Meta<typeof RangeField> = {
  title: "Form control / RangeField",
  component: RangeField,
};
export default meta;

export const Random: StoryObj = {
  args: {
    from: faker.number.float({ min: -10, max: 10, fractionDigits: 3 }),
    till: faker.number.float({ min: 50, max: 100, fractionDigits: 3 }),
    value: faker.number.float({ min: 10, max: 50, fractionDigits: 3 }),
    location: faker.helpers.arrayElement(["alone", "top", "middle", "bottom"]),
  },
};
