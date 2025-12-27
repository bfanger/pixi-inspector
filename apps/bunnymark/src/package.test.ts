import { test, expect } from "vitest";

test("pixi.js v3", async () => {
  const pkg = await import("../package.json");
  expect(pkg).toBeDefined();
  expect(pkg.devDependencies["pixi.js"]).toBe("3");
  expect(pkg.devDependencies["@types/pixi.js"]).toBe("3");
});
