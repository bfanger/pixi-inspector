import type { Meta, StoryObj } from "@storybook/svelte-vite";
import ExamplesComponent from "./Examples.svelte";

const meta: Meta<typeof ExamplesComponent> = {
  title: "Form control / SelectMenu",
  component: ExamplesComponent,
};
export default meta;

export const Examples: StoryObj = {};
