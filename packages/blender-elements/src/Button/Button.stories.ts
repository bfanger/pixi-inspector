import type { Meta, StoryObj } from "@storybook/svelte-vite";
import { faker } from "@faker-js/faker/locale/en";
import { expect, fn } from "storybook/test";

import Button from "./Button.svelte";

const meta: Meta<typeof Button> = {
  title: "Form control / Button",
  component: Button,
  args: {
    setValue: fn(),
    onclick: fn(),
  },
};

export default meta;

export const Random: StoryObj = {
  args: {
    value: faker.datatype.boolean() ? faker.datatype.boolean() : undefined,
    label: faker.lorem.words(),
    hint: faker.lorem.sentence(),
  },
};
export const TestClick: StoryObj = {
  args: {
    label: "Click me",
  },
  play: async ({ args, canvas, userEvent }) => {
    const button = canvas.getByRole("button", { name: "Click me" });
    await userEvent.click(button);
    expect(args.onclick).toHaveBeenCalledOnce();
    expect(args.setValue).not.toBeCalled();
  },
};

export const TestToggle: StoryObj = {
  args: {
    label: "Toggle me",
    value: false,
  },
  play: async ({ args, canvas, userEvent }) => {
    const button = canvas.getByRole("button", { name: "Toggle me" });
    await userEvent.click(button);
    expect(args.setValue).toHaveBeenLastCalledWith(true);
    await userEvent.click(button);
    expect(args.setValue).toHaveBeenLastCalledWith(false);
  },
};
