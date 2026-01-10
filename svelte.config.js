import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

/**
 * @type {{
 *   preprocess: import("svelte/compiler").PreprocessorGroup,
 *   compilerOptions: import("svelte/compiler").CompileOptions,
 * }}
 */
const svelteConfig = {
  preprocess: [vitePreprocess()],
  compilerOptions: { css: "injected", fragments: "tree" },
};
export default svelteConfig;
