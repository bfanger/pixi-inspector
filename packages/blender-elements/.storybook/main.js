const svelteConfig = require("../../../svelte.config.cjs");

module.exports = {
  core: { builder: "@storybook/builder-vite" },
  stories: ["../**/*.stories.svelte"],
  addons: ["@storybook/addon-links", "@storybook/addon-essentials"],
  framework: "@storybook/svelte",
  svelteOptions: { preprocess: svelteConfig.preprocess },
};
