/**
 * Icons are from Blender
 *
 * LICENSE: https://download.blender.org/release/GPL-license.txt
 */
import iconToSvg from "./icons.json";
export type Icon = keyof typeof iconToSvg;
export const icons = Object.keys(iconToSvg) as Icon[];

let cache: string;
export function css(): string {
  if (typeof URL.createObjectURL !== "function") {
    return "";
  }
  if (cache) {
    return cache;
  }
  const cssVars = [];
  for (const [name, data] of Object.entries(iconToSvg)) {
    const url = URL.createObjectURL(
      new Blob([data], { type: "image/svg+xml" }),
    );
    cssVars.push(`--icon-${name}: url(${url})`);
    if (name.includes("_")) {
      cssVars.push(`--icon-${name.replaceAll("_", "-")}: var(--icon-${name})`);
    }
  }
  cache = cssVars.join(";\n");
  return cache;
}
