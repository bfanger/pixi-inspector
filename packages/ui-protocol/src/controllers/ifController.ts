import defineUI, { type UIProtocolInit } from "../svelte/defineUI";

type Falsy = undefined | null | false;
/**
 * Checks if the value is truthy and then use the whenTruthy block else use the whenFalsy block.
 * The whenTruthy block receives a ref object where the value property is the latest truthy value.
 */
export default function ifController<T>(
  getValue: () => T | Falsy,
  whenTruthy: (ref: { value: T }) => UIProtocolInit[],
  whenFalsy: () => UIProtocolInit[] = () => [],
) {
  const ref = { value: getValue() };

  let previous = ref.value;

  return defineUI({
    component: "Fragment",
    slots: {
      children: ref.value ? whenTruthy(ref as { value: T }) : whenFalsy(),
    },
    sync(patch) {
      const next = getValue();
      if (next) {
        ref.value = next;
      }
      if (!previous === !next) {
        return;
      }
      previous = next;
      const children = next ? whenTruthy(ref as { value: T }) : whenFalsy();
      const previousLength = this.slots!.children.length;

      for (let i = 0; i < Math.min(children.length, previousLength); i++) {
        patch.replacements.push({ ...children[i], index: i });
      }
      if (children.length < previousLength) {
        patch.truncate.children = children.length;
      } else {
        for (let i = previousLength; i < children.length; i++) {
          patch.appends.push(children[i]);
        }
      }
    },
  });
}
