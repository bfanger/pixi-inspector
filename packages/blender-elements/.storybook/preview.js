import { css } from "../src/icons";

/** @type { import('@storybook/svelte').Preview } */
const preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

document.body.style = `font:
      13px/1.3 system-ui,
      sans-serif;
    height: 100vh;
    -webkit-font-smoothing: antialiased;
    background: #353535;
    text-shadow: 0 1px 1px rgba(black, 0.4);\n${css()}`;

export default preview;
