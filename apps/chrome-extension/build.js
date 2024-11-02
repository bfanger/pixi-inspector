// @ts-check
import esbuild from "esbuild";
import sveltePlugin from "esbuild-svelte";
import fs from "fs";
import path from "path";
import { rimrafSync } from "rimraf";
import { fileURLToPath } from "url";
import svelteConfig from "../../svelte.config.js";

const cwd = path.dirname(fileURLToPath(import.meta.url));
const outdir = path.resolve(cwd, "build");
const srcDir = path.resolve(cwd, "src");

rimrafSync(outdir);

fs.mkdirSync(outdir, { recursive: true });
for (const file of [
  "manifest.json",
  "pixi-devtools.html",
  "pixi-panel.html",
  "pixi-popup.html",
  "pixi-panel-hint.png",
  "icon.png",
  "panel-icon.png",
]) {
  fs.copyFileSync(path.join(srcDir, file), path.join(outdir, file));
}
const WATCH = process.argv.indexOf("--watch") !== -1;
const ctx = await esbuild.context({
  define: {
    WATCH: JSON.stringify(WATCH),
  },
  entryPoints: [
    path.join(srcDir, "pixi-devtools.ts"),
    path.join(srcDir, "pixi-panel.ts"),
  ],
  mainFields: ["svelte", "browser", "module", "main"],
  bundle: true,
  outdir,

  plugins: [sveltePlugin(svelteConfig)],
  logLevel: "info",
});
if (WATCH) {
  await ctx.watch();
  await ctx.serve({ port: 10808 });
} else {
  await ctx.rebuild();
  await ctx.dispose();
}
