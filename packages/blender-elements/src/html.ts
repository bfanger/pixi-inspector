const div = document.createElement("div");
/**
 * Helper for syntax highlighting the html inside the template literal.
 * Requires the VSCode plugin: [lit-plugin](https://marketplace.visualstudio.com/items?itemName=runem.lit-plugin)
 *
 * Usage:
 * const div = html`<div><h1>Hello world</h1><p>Welcome</p></div>`
 */
export function html(
  content: TemplateStringsArray,
  ...args: (string | number)[]
): HTMLElement {
  div.innerHTML = content.reduce(
    (result, part, i) => result + part + (args[i] ?? ""),
    "",
  );
  const child = div.firstElementChild;
  if (!child || div.children.length !== 1) {
    throw new Error("html must contain only one root element");
  }
  return child as HTMLElement;
}
