import { css } from "../src/icons";
import type { Preview } from "@storybook/svelte-vite";
const preview: Preview = {
  // parameters: {
  //   controls: {
  //     matchers: {
  //       color: /(background|color)$/i,
  //       date: /Date$/i,
  //     },
  //   },
  // },
};
export default preview;

document.body.style = `font:
      13px/1.3 system-ui,
      sans-serif;
    height: 100vh;
    -webkit-font-smoothing: antialiased;
    background: #353535;
    text-shadow: 0 1px 1px #00000066;\n${css()}`;
