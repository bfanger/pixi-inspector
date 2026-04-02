import type { Meta, StoryObj } from "@storybook/svelte-vite";
import { faker } from "@faker-js/faker/locale/en";

import ColorField from "./ColorField.svelte";
import { fn } from "storybook/test";

const meta: Meta<typeof ColorField> = {
  title: "Form control / ColorField",
  component: ColorField,
  args: {
    value: "#0000ff",
    setValue: fn(),
  },
};

export default meta;

export const Random: StoryObj = {
  args: {
    value: `#${faker.number.int({ min: 0, max: 16777215 }).toString(16).padStart(6, "0")}${faker.datatype.boolean() ? "" : faker.number.int(255).toString(16).padStart(2, "0")}`,
  },
};
