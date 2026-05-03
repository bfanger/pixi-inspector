import defineUI, { type UIProtocolInit } from "../svelte/defineUI";

/**
 * Controller that manages a VirtualList with dynamic item rendering.
 *
 * Only renders items visible in the viewport region.
 * Use `slice(offset, count)` to return the total count and children for the visible range.
 */
export default function virtualListController<T>(options: {
  itemSize: number;
  buffer: number;
  variant: "striped";
  getKeys: (offset: number, count: number) => { total: number; keys: T[] };
  render: (key: T) => UIProtocolInit;
  jumpToRef?: { index: number | undefined };
}) {
  const { getKeys, render, jumpToRef, ...props } = options;
  const itemToSlotMap = new Map<T, `slot${number}`>();
  let offset = 0;
  let count = 0;
  let total = getKeys(offset, count).total;

  return defineUI({
    component: "VirtualList",
    props: { ...props, total },
    value: [],
    slots: {},
    events: {
      render: [
        (newOffset, newCount) => {
          offset = newOffset;
          count = newCount;
        },
        { throttle: 50 },
      ],
    },
    sync(patch) {
      const exists = new Set<T>();
      const slice = getKeys(offset, count);

      slice.keys.forEach((item) => exists.add(item));
      const remove: T[] = [];
      const offsets: { slot: `slot${number}`; offset: number }[] = [];

      itemToSlotMap.forEach((_, item) => {
        if (!exists.has(item)) {
          remove.push(item);
        }
      });
      for (const item of remove) {
        itemToSlotMap.delete(item);
      }
      const occupied = new Set(itemToSlotMap.values());

      let start = 0;
      slice.keys.forEach((item, i) => {
        const slot = itemToSlotMap.get(item);
        if (slot) {
          offsets.push({ slot, offset: offset + i });
          return; // Reuse existing
        }
        for (
          let slotIndex = start;
          slotIndex < slice.keys.length;
          slotIndex++
        ) {
          const slot = `slot${slotIndex}` as const;
          if (occupied.has(slot)) {
            continue;
          }
          start = slotIndex + 1;
          if (!this.slots![slot]) {
            patch.appends.push({ slot, ...render(item) });
          } else {
            patch.replacements.push({
              slot,
              index: 0,
              ...render(item),
            });
          }
          occupied.add(slot);
          offsets.push({ slot, offset: i + offset });
          itemToSlotMap.set(item, slot);
          return;
        }
      });
      if (slice.total !== total || jumpToRef?.index !== undefined) {
        total = slice.total;
        patch.props = { ...props, jumpTo: jumpToRef?.index, total };
        if (jumpToRef) {
          jumpToRef.index = undefined;
        }
      }
      for (const slot of Object.keys(this.slots!)) {
        if (!occupied.has(slot as `slot${number}`)) {
          patch.truncate[slot] = null;
        }
      }
      patch.value = offsets;
    },
  });
}
