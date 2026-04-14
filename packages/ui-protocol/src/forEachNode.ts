import defineUI, { type UIProtocolInit } from "./svelte/defineUI";

/**
 * Create components for all entries in the array.
 * Will recreate the component if the entry on the index !== the previous value.
 */
export default function forEachNode<T>(
  all: () => readonly T[],
  createChild: (entry: T, index: number) => UIProtocolInit,
) {
  let previous = all().slice(0);
  return defineUI({
    component: "Fragment",
    children: previous.map((key, i) => createChild(key, i)),
    sync(patch) {
      const next = all().slice(0);
      const min = Math.min(previous.length, next.length);
      for (let i = 0; i < min; i++) {
        const key = next[i];
        if (key !== previous[i]) {
          patch.replacements.push({ ...createChild(key, i), index: i });
        }
      }
      if (next.length > previous.length) {
        for (let i = previous.length; i < next.length; i++) {
          patch.appends.push(createChild(next[i], i));
        }
      } else if (next.length < previous.length) {
        patch.truncate = next.length;
      }
      previous = next;
    },
  });
}
