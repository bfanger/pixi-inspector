import type { UIProtocolInit } from "ui-protocol/src/svelte/defineUI";
import { persistent } from "./storage";

export default function gizmoToggle(): UIProtocolInit {
  return {
    component: "ToggleButton",
    props: { icon: "gizmo", rounded: "all", hint: "Toggle gizmo" },
    getValue: () => !persistent.get("gizmo:hidden"),
    setValue(value) {
      persistent.set("gizmo:hidden", !value);
    },
  };
}
