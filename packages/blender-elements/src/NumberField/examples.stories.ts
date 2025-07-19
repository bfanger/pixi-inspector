import type { Meta, StoryObj } from "@storybook/svelte-vite";
import ExamplesComponent from "./Examples.svelte";

const meta: Meta<typeof ExamplesComponent> = {
  title: "Form control / NumberField",
  component: ExamplesComponent,
};
export default meta;

export const Examples: StoryObj = {};
