import type { Meta, StoryObj } from "@storybook/svelte-vite";
import { faker } from "@faker-js/faker/locale/en";

import ColorInput from "./ColorInput.svelte";
import { fn } from "storybook/test";

const meta: Meta<typeof ColorInput> = {
  title: "Form control / ColorInput",
  component: ColorInput,
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
