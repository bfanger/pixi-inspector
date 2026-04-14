import type { Application } from "pixi.js";
import conditionalNode from "ui-protocol/src/conditionalNode";
import defineUI from "ui-protocol/src/svelte/defineUI";
import session from "./session";
import errorBoundaryNode from "ui-protocol/src/errorBoundaryNode";

export default function pixiApplicationTab(app: Application | undefined) {
  return defineUI({
    component: "Fragment",
    children: !app
      ? []
      : [
          conditionalNode(() => !!app?.ticker, tickerPanel(app)),
          conditionalNode(
            () => typeof app?.renderer?.background?.color?.toHex === "function",
            backgroundPanel(app),
          ),
        ],
  });
}

function tickerPanel(app: Application) {
  return errorBoundaryNode(() => ({
    component: "Panel",
    props: {
      title: "Ticker",
      expanded: session.get<boolean>("pixi:tickerPanel") ?? true,
    },
    events: {
      setExpanded: (expanded) => session.set("pixi:tickerPanel", expanded),
    },
    children: [
      {
        component: "Box",
        props: { gap: 6, padding: 8 },
        children: [
          {
            component: "Property",
            props: { label: "Speed", hint: "Factor of current deltaTime" },
            children: [
              {
                component: "NumberInput",
                props: { step: 0.01 },
                getValue: () => app.ticker.speed,
                setValue(speed) {
                  app.ticker.speed = speed;
                },
              },
            ],
          },
          {
            component: "Property",
            props: {
              hint: "Whether or not this ticker has been started",
            },
            children: [
              conditionalNode(
                () => app.ticker.started,
                {
                  component: "ToggleButton",
                  props: { icon: "pause" },
                  events: {
                    onclick() {
                      app.ticker.stop();
                    },
                  },
                },
                {
                  component: "ToggleButton",
                  props: { icon: "play" },
                  events: {
                    onclick() {
                      app.ticker.start();
                    },
                  },
                },
              ),
            ],
          },
        ],
      },
    ],
  }));
}

function backgroundPanel(app: Application) {
  return errorBoundaryNode(() => ({
    component: "Panel",
    props: {
      title: "Background",
      expanded: session.get<boolean>("pixi:backgroundPanel") ?? true,
    },
    events: {
      setExpanded: (expanded) => session.set("pixi:backgroundPanel", expanded),
    },
    children: [
      {
        component: "Box",
        props: { gap: 6, padding: 8 },
        children: [
          {
            component: "Property",
            props: {
              label: "Color",
              hint: "The background color and alpha of the main view",
            },
            children: [
              {
                component: "ColorInput",
                getValue() {
                  const bg = app.renderer.background;
                  const hex = bg.color.toHex();
                  if (bg.alpha >= 1) {
                    return hex;
                  }
                  return (
                    hex +
                    Math.round(bg.alpha * 255)
                      .toString(16)
                      .padStart(2, "0")
                  );
                },
                setValue(color) {
                  const bg = app.renderer.background;
                  if (color.length === 7) {
                    bg.color = color;
                  } else if (color.length === 9) {
                    bg.color = color.substring(0, 7);
                    bg.alpha = parseInt(color.substring(7), 16) / 255;
                  }
                },
              },
            ],
          },
        ],
      },
    ],
  }));
}
