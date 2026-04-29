import defineUI, { type UIProtocolInit } from "../svelte/defineUI";

export default function switchController<T extends string>(
  selected: () => T | undefined,
  choices: Record<T, UIProtocolInit | (() => UIProtocolInit)>,
) {
  let previous = selected();
  let choice = previous === undefined ? undefined : choices[previous];
  let ui: UIProtocolInit | undefined =
    typeof choice === "function" ? choice() : choice;

  return defineUI({
    component: "Fragment",
    children: ui ? [ui] : [],
    sync(patch) {
      const current = selected();
      if (current === previous) {
        return;
      }
      previous = current;
      choice = current === undefined ? undefined : choices[current];
      if (choice) {
        ui = typeof choice === "function" ? choice() : choice;
        if (this.slots?.children.length === 0) {
          patch.appends.push(ui);
        } else {
          patch.replacements.push({
            ...ui,
            index: 0,
          });
        }
      } else if (this.slots?.children.length === 1) {
        patch.truncate.children = 0;
      }
    },
  });
}
