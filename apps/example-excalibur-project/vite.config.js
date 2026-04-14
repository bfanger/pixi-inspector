//@ts-check
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    {
      name: "tiled-tileset-plugin",
      resolveId: {
        order: "pre",
        handler(sourceId) {
          if (!sourceId.endsWith(".tsx")) {
            return;
          }
          return { id: `tileset:${sourceId}`, external: "relative" };
        },
      },
    },
  ],
  build: { assetsInlineLimit: 0, sourcemap: true },
});
