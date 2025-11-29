import { svelte } from "@sveltejs/vite-plugin-svelte";
import { defineConfig, type ViteUserConfig } from "vitest/config";
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";

export default defineConfig({
  plugins: [svelte(), storybookTest()] as ViteUserConfig["plugins"],
  test: {
    browser: {
      enabled: true,
      headless: true,
      instances: [{ browser: "chromium" }],
      provider: playwright(),
    },
    setupFiles: [".storybook/vitest.setup.ts"],
  },
});
