import type { Application, BackgroundSystem, Ticker } from "pixi.js";
import conditionalNode from "ui-protocol/src/conditionalNode";
import defineUI from "ui-protocol/src/svelte/defineUI";
import session from "./session";
import errorBoundaryNode from "ui-protocol/src/errorBoundaryNode";
import panelNode from "ui-protocol/src/panelNode";

export default function pixiApplicationTab(appRef: {
  value: Application | undefined;
}) {
  return defineUI({
    component: "Fragment",
    children: [
      conditionalNode(() => appRef.value?.ticker, tickerPanel),
      conditionalNode(
        () => appRef.value?.renderer?.background,
        backgroundPanel,
      ),
    ],
  });
}

function tickerPanel(tickerRef: { value: Ticker }) {
  return errorBoundaryNode(() =>
    panelNode(
      {
        title: "Ticker",
        expanded: session.get<boolean>("pixi:tickerPanel") ?? true,
        setExpanded: (expanded) => session.set("pixi:tickerPanel", expanded),
      },
      () => ({
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
                getValue: () => tickerRef.value.speed,
                setValue(speed) {
                  tickerRef.value.speed = speed;
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
                () => tickerRef.value.started,
                {
                  component: "ToggleButton",
                  props: { icon: "pause" },
                  events: {
                    onclick() {
                      tickerRef.value.stop();
                    },
                  },
                },
                {
                  component: "ToggleButton",
                  props: { icon: "play" },
                  events: {
                    onclick() {
                      tickerRef.value.start();
                    },
                  },
                },
              ),
            ],
          },
        ],
      }),
    ),
  );
}

function backgroundPanel(backgroundRef: { value: BackgroundSystem }) {
  return errorBoundaryNode(() =>
    panelNode(
      {
        title: "Background",
        expanded: session.get<boolean>("pixi:backgroundPanel") ?? true,
        setExpanded: (expanded) =>
          session.set("pixi:backgroundPanel", expanded),
      },
      () => ({
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
                  const color = backgroundRef.value.color;
                  const hex =
                    typeof color.toHex === "function" ? color.toHex() : color; // v8 Color object, v7 string
                  if (typeof hex !== "string") {
                    return "";
                  }
                  if (backgroundRef.value.alpha >= 1) {
                    return hex;
                  }
                  return (
                    hex +
                    Math.round(backgroundRef.value.alpha * 255)
                      .toString(16)
                      .padStart(2, "0")
                  );
                },
                setValue(color) {
                  if (color.length === 7) {
                    backgroundRef.value.color = color;
                  } else if (color.length === 9) {
                    backgroundRef.value.color = color.substring(0, 7);
                    backgroundRef.value.alpha =
                      parseInt(color.substring(7), 16) / 255;
                  }
                },
              },
            ],
          },
        ],
      }),
    ),
  );
}
