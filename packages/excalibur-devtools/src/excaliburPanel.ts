import { Color, type Engine } from "excalibur";
import ifController from "ui-protocol/src/controllers/ifController";
import refreshController from "ui-protocol/src/controllers/refreshController";
import excaliburTreeView from "./excaliburTreeView";
import errorBoundaryController from "ui-protocol/src/controllers/errorBoundaryController";
import panelController from "ui-protocol/src/controllers/panelController";

export default function excaliburPanel(engine: Engine) {
  return refreshController({
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
              ifController(() => Object.keys(engine.scenes).length > 1, {
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
  return errorBoundaryController(() =>
    panelController({ title: "Engine" }, () => ({
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
