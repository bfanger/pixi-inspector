// @ts-check
import fs from "fs";
import { fileURLToPath } from "url";
import path from "path";
import esbuild from "esbuild";
import sveltePlugin from "esbuild-svelte";
import rimraf from "rimraf";
// eslint-disable-next-line import/no-relative-packages
import svelteConfig from "../../svelte.config.cjs";

const WATCH = process.argv.indexOf("--watch") !== -1;

const cwd = path.dirname(fileURLToPath(import.meta.url));
const outdir = path.resolve(cwd, "build");
const srcDir = path.resolve(cwd, "src");
if (!WATCH) {
  rimraf.sync(outdir);
}

fs.mkdirSync(outdir, { recursive: true });
for (const file of [
  "manifest.json",
  "pixi-devtools.html",
  "pixi-panel.html",
  "icon.png",
  "icon@2x.png",
  "panel-icon.svg",
]) {
  fs.copyFileSync(path.join(srcDir, file), path.join(outdir, file));
}
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
} else {
  await ctx.rebuild().then(() => {
    ctx.dispose();
  });
}
