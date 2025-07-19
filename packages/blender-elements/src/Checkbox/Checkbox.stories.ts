import type { Meta, StoryObj } from "@storybook/svelte-vite";
import { faker } from "@faker-js/faker/locale/en";
import { expect, fn } from "storybook/test";

import Checkbox from "./Checkbox.svelte";

const meta: Meta<typeof Checkbox> = {
  title: "Form control / Checkbox",
  component: Checkbox,
  args: { setValue: fn() },
};

export default meta;

export const Random: StoryObj = {
  args: {
    value: faker.datatype.boolean(),
    label: faker.lorem.words(),
    hint: faker.lorem.sentence(),
  },
};
export const Test: StoryObj = {
  args: {
    value: false,
    label: "Toggle me",
  },
  play: async ({ args, canvas, userEvent }) => {
    const checkbox = canvas.getByRole("checkbox", { name: "Toggle me" });
    await expect(checkbox).not.toBeChecked();
    await userEvent.click(checkbox);
    expect(args.setValue).toHaveBeenCalledWith(true);
    await expect(checkbox).toBeChecked();
  },
};
