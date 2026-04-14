import { Color, type Engine } from "excalibur";
import conditionalNode from "ui-protocol/src/conditionalNode";
import refreshNode from "ui-protocol/src/refreshNode";
import defineUI from "ui-protocol/src/svelte/defineUI";
import excaliburTreeView from "./excaliburTreeView";

export default function excaliburPanel(engine: Engine) {
  return refreshNode({
    interval: 1000,
    children: [
      {
        component: "SplitPanels",
        props: { direction: "column" },
        children: [
          {
            component: "SplitPanel",
            props: { minHeight: 100 },
            children: [
              conditionalNode(() => Object.keys(engine.scenes).length > 1, {
                component: "Button",
                props: { label: "TODO: Select scene" },
              }),
              excaliburTreeView(engine.rootScene),
            ],
          },
          {
            component: "SplitPanel",
            props: { minHeight: 100 },
            children: [backgroundPanel(engine)],
          },
        ],
      },
    ],
  });
}

function backgroundPanel(engine: Engine) {
  return defineUI({
    component: "Panel",
    props: { title: "Engine" },
    children: [
      {
        component: "Box",
        props: { gap: 6, padding: 8 },
        children: [
          {
            component: "Property",
            props: { label: "Background" },
            children: [
              {
                component: "ColorInput",
                props: { label: "Background" },
                getValue: () => engine.backgroundColor.toHex(),
                setValue: (hex) => {
                  engine.backgroundColor = Color.fromHex(hex);
                },
              },
            ],
          },
        ],
      },
    ],
  });
}
