import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

/**
 * @type {import("@sveltejs/vite-plugin-svelte").SvelteConfig}
 */
const svelteConfig = {
  preprocess: [vitePreprocess()],
  compilerOptions: { css: "injected", fragments: "tree" },
};
export default svelteConfig;
