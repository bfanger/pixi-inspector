import { svelte } from "@sveltejs/vite-plugin-svelte";
import { defineConfig, type ViteUserConfig } from "vitest/config";
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";

export default defineConfig({
  plugins: [svelte(), storybookTest()] as ViteUserConfig["plugins"],
  test: {
    browser: {
      enabled: true,
      headless: true,
      provider: "playwright",
      instances: [{ browser: "chromium" }],
    },
    setupFiles: [".storybook/vitest.setup.ts"],
  },
});
