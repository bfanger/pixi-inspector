import { css } from "../src/icons";
import type { Preview } from "@storybook/svelte-vite";

const preview: Preview = {};
export default preview;

/**
 * Same CSS as <Base /> component
 */
document.body.style = `
    height: 100vh;

    font:
      11px/1.3 system-ui,
      sans-serif;
    -webkit-font-smoothing: antialiased;
    color: #e5e5e5;
    text-shadow: 0 1px 1px #0006;

    background: #161616;
    ${css()}`;
