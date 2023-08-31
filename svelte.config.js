// eslint-disable-next-line filenames/match-exported
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

/**
 * @type {{
 *   preprocess: import("svelte/types/compiler/preprocess").PreprocessGroup,
 *   compilerOptions: import("svelte/types/compiler/interfaces").CompileOptions,
 * }}
 */
const svelteConfig = {
  preprocess: [vitePreprocess()],
  compilerOptions: { css: "injected" },
};
export default svelteConfig;
