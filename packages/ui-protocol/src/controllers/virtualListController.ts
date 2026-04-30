import defineUI, {
  type UIProtocolInit,
  type UIProtocolPatch,
} from "../svelte/defineUI";
import type {
  TreeControllerNode,
  TreeEventHandler,
  TreePatch,
  TreeValue,
} from "../types";

/**
 * Controller that manages a VirtualList with dynamic item rendering.
 *
 * Only renders items visible in the viewport plus a buffer region.
 * Use `slice(offset, count)` to return the total count and children for the visible range.
 */
export default function virtualListController<
  TItem,
  TComponent extends UIProtocolInit["component"],
  TInit extends UIProtocolInit = Extract<
    UIProtocolInit,
    { component: TComponent }
  >,
>(options: {
  component: TComponent;
  itemSize: number;
  buffer: number;
  getItems: (
    offset: number,
    count: number,
  ) => { total: number; items: TItem[] };
  itemSync: (
    patch: UIProtocolPatch<NonNullable<TInit["props"]>>,
    item: TItem,
  ) => void;
  events: TInit["events"];
}) {
  let offset = 0;
  let count = 0;
  const { component, getItems, itemSync, events = {}, ...props } = options;
  let slice = getItems(0, 0);

  return defineUI({
    component: "VirtualList",
    props: { ...props, total: slice.total, variant: "striped" },
    value: 0,
    events: {
      render: [
        (newOffset, newCount) => {
          offset = newOffset;
          count = newCount;
        },
        { throttle: 50 },
      ],
    },
    children: [],
    sync(patch) {
      slice = getItems(offset, count);
      if (this.slots!.children.length < slice.items.length) {
        for (let i = this.slots!.children.length; i < slice.items.length; i++) {
          const itemPatch: any = {
            appends: [],
            replacements: [],
            truncate: {},
          } satisfies TreePatch;
          itemSync(itemPatch, slice.items[i]);

          patch.appends.push({
            component,
            props: itemPatch.props,
            value: itemPatch.value,
            sync(patch: TreePatch) {
              itemSync(patch as any, slice.items[i]);
            },
            events: Object.fromEntries(
              Object.entries(events).map(([event, entry]) => {
                let handler = entry as TreeEventHandler;
                const wrapped = function (
                  this: TreeControllerNode,
                  ...args: TreeValue[]
                ) {
                  handler.call(this, slice.items[i] as any, ...args);
                };
                if (Array.isArray(entry)) {
                  handler = entry[0];
                  return [event, [wrapped, entry[1]]];
                }
                return [event, wrapped];
              }),
            ),
          } as UIProtocolInit);
        }
      }
      if (this.slots!.children.length > slice.items.length) {
        patch.truncate.children = slice.items.length;
      }
      patch.value = offset;
    },
  });
}
