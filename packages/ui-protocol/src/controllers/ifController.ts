import defineUI, { type UIProtocolInit } from "../svelte/defineUI";

type Falsy = undefined | null | false;
/**
 * Checks if the value is truthy and then use the whenTruthy block else use the whenFalsy block.
 * The whenTruthy block receives a ref object where the value property is the latest truthy value.
 */
export default function ifController<T>(
  getValue: () => T | Falsy,
  whenTruthy: UIProtocolInit | ((ref: { value: T }) => UIProtocolInit),
  whenFalsy?: UIProtocolInit | (() => UIProtocolInit),
) {
  const ref = { value: getValue() };
  function createChild(value: T | Falsy): UIProtocolInit | undefined {
    if (value) {
      if (typeof whenTruthy === "function") {
        return whenTruthy(ref as { value: T });
      }
      return whenTruthy;
    }
    if (typeof whenFalsy === "function") {
      return whenFalsy();
    }
    return whenFalsy;
  }
  let ui = createChild(ref.value);
  let previous = ref.value;

  return defineUI({
    component: "Fragment",
    children: ui ? [ui] : [],
    sync(patch) {
      const next = getValue();
      if (next) {
        ref.value = next;
      }
      if (!previous === !next) {
        return;
      }
      previous = next;
      ui = createChild(next);
      if (!ui) {
        patch.truncate.children = 0;
      } else if (this.slots?.children.length === 0) {
        patch.appends.push(ui);
      } else {
        patch.replacements.push({ ...ui, index: 0 });
      }
    },
  });
}
