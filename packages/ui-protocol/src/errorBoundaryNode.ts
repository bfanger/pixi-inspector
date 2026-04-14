import defineUI, { type UIProtocolInit } from "./svelte/defineUI";

export default function errorBoundaryNode(child: () => UIProtocolInit) {
  let remove = false;
  let restored = 0;
  return defineUI({
    component: "ErrorBoundary",
    events: {
      onerror() {
        remove = true;
      },
      onrestore(value) {
        restored = value;
      },
    },
    children: [child()],
    sync(patch) {
      if (remove) {
        patch.truncate = 0;
        remove = false;
      } else if (restored) {
        patch.appends.push(child());
        patch.props = { restored };
        restored = 0;
      }
    },
  });
}
