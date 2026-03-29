import type { Meta, StoryObj } from "@storybook/svelte-vite";
import { faker } from "@faker-js/faker/locale/en";

import ColorPicker from "./ColorPicker.svelte";
import { fn } from "storybook/test";

const meta: Meta<typeof ColorPicker> = {
  title: "Form control / ColorPicker",
  component: ColorPicker,
  args: {
    value: "#0000ff",
    setValue: fn(),
  },
};

export default meta;

export const Basic: StoryObj = {
  args: {
    value: "#0000ff",
  },
};

export const Random: StoryObj = {
  args: {
    value: `#${faker.number.int({ min: 0, max: 16777215 }).toString(16).padStart(6, "0")}`,
  },
};
