import fs from "node:fs/promises";
import zip from "zip-dir";

const filename = "../../chrome-extension.zip";
await fs.rm(filename, { force: true });

const buffer = await zip("build");
await fs.writeFile(filename, buffer, { encoding: "binary" });
