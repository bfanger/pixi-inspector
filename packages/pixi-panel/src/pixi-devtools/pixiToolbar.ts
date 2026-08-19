import type { UIProtocolInit } from "ui-protocol/src/svelte/defineUI";
import { persistent } from "./storage";
import ifController from "ui-protocol/src/controllers/ifController";

export default function pixiToolbar(hasGizmo: () => boolean): UIProtocolInit {
  return ifController(hasGizmo, () => [
    {
      component: "Box",
      props: { align: "end", padding: "2px 8px" },
      children: [
        {
          component: "ToggleButton",
          props: { icon: "gizmo", rounded: "all", hint: "Show Gizmo" },
          getValue: () => !persistent.get("gizmo:hidden"),
          setValue(value) {
            persistent.set("gizmo:hidden", !value);
          },
        },
      ],
    },
  ]);
}
