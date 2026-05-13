import { Color, type Engine } from "excalibur";
import ifController from "ui-protocol/src/controllers/ifController";
import excaliburTreeView from "./excaliburTreeView";
import errorBoundaryController from "ui-protocol/src/controllers/errorBoundaryController";
import panelController from "ui-protocol/src/controllers/panelController";
import defineUI from "ui-protocol/src/svelte/defineUI";

export default function excaliburPanel(engine: Engine) {
  return defineUI({
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
          ifController(
            () => engine.rootScene,
            (ref) => excaliburTreeView(ref),
          ),
        ],
      },
      {
        component: "SplitPanel",
        props: { minHeight: 100 },
        children: [enginePanel(engine)],
      },
    ],
  });
}
const win = window as any;

function enginePanel(engine: Engine) {
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
        {
          component: "Property",
          children: [
            {
              component: "CheckboxInput",
              props: { label: "Draw debug" },
              getValue: () => win.___EXCALIBUR_DEVTOOL._isDebug as boolean,
              setValue(enabled) {
                win.___EXCALIBUR_DEVTOOL.showDebug(enabled);
              },
            },
          ],
        },
      ],
    })),
  );
}
