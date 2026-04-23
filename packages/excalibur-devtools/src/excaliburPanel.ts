import { Color, type Engine } from "excalibur";
import conditionalNode from "ui-protocol/src/conditionalNode";
import refreshNode from "ui-protocol/src/refreshNode";
import excaliburTreeView from "./excaliburTreeView";
import errorBoundaryNode from "ui-protocol/src/errorBoundaryNode";
import panelNode from "ui-protocol/src/panelNode";

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
  return errorBoundaryNode(() =>
    panelNode({ title: "Engine" }, () => ({
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
    })),
  );
}
