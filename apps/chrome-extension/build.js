import esbuild from "esbuild";
import sveltePlugin from "esbuild-svelte";
import WebSocket, { WebSocketServer } from "ws";
// eslint-disable-next-line import/no-relative-packages
import svelteConfig from "../../svelte.config.cjs";

const port = 10808;
let watch;
if (process.argv.indexOf("--watch") !== -1) {
  const wss = new WebSocketServer({ port });
  watch = {
    onRebuild(err) {
      if (err) {
        return;
      }
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send("RELOAD");
        }
      });
    },
  };
}
esbuild
  .build({
    define: {
      WATCH: JSON.stringify(!!watch),
    },
    entryPoints: ["src/pixi-devtools.ts", "src/pixi-panel.ts"],
    mainFields: ["svelte", "browser", "module", "main"],
    bundle: true,
    outdir: "build/",

    plugins: [sveltePlugin(svelteConfig)],
    logLevel: "info",
    watch,
  })
  .catch(() => process.exit(1));
