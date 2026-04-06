import defineUI, { type UIProtocolInit } from "./svelte/defineUI";

export default function conditionalNode(
  predicate: () => boolean,
  whenTrue: UIProtocolInit | (() => UIProtocolInit),
  whenFalse?: UIProtocolInit | (() => UIProtocolInit),
) {
  let previous = predicate();
  let choice = previous ? whenTrue : whenFalse;
  let ui = choice instanceof Function ? choice() : choice;
  return defineUI({
    component: "Fragment",
    children: ui ? [ui] : [],
    sync(patch) {
      const current = predicate();
      if (current === previous) {
        return;
      }
      previous = current;
      choice = current ? whenTrue : whenFalse;
      ui = choice instanceof Function ? choice() : choice;
      if (!ui) {
        patch.truncate = 0;
      } else if (this.children.length === 0) {
        patch.appends.push(ui);
      } else {
        patch.replacements.push({ ...ui, index: 0 });
      }
    },
  });
}
