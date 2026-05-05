import defineUI, { type UIProtocolInit } from "../svelte/defineUI";
import virtualListController from "./virtualListController";

type TreeViewRowInit = Extract<UIProtocolInit, { component: "TreeViewRow" }>;
type TreeViewRowProps = NonNullable<TreeViewRowInit["props"]>;

type Options<T extends WeakKey> = {
  buffer: number;
  jumpToRef?: { key: T | undefined };
  focusRef?: { key: T | undefined };
  getRoot: () => T;
  getNestedCount: (key: T) => number;
  getNestedKey: (key: T, index: number) => T;
  getIndex: (parent: T, key: T) => number;
  syncProps: (key: T, props: TreeViewRowProps, parents: T[]) => void;
  activate?: (key: T) => number | undefined;
  ondblclick?: (key: T) => number | undefined;
  onkeydown?: (key: T, event: { key: string }) => number | undefined;
  initSlots?: (
    key: T,
    parents: T[],
  ) => Record<string, UIProtocolInit[]> | undefined;
};
export default function treeViewController<T extends WeakKey>(
  options: Options<T>,
) {
  const {
    getRoot,
    getNestedCount,
    getNestedKey,
    getIndex,
    syncProps,
    jumpToRef: jumpToRefProp,
    focusRef: focusRefProp,
    activate,
    ondblclick,
    onkeydown,
    initSlots,
    ...props
  } = options;
  const parentsStore = new Map<T, T[]>();
  const jumpToIndexRef = { index: undefined as number | undefined };
  type Slice = { total: number; keys: T[] };
  const jumpToRef = jumpToRefProp ?? { key: undefined };
  const focusRef = focusRefProp ?? { key: undefined };
  const expanded = new WeakMap<T, boolean>();

  function getExpanded(key: T, parents: T[]) {
    const value = expanded.get(key);
    if (value !== undefined) {
      return value;
    }
    if (getNestedCount(key) === 0) {
      return undefined;
    }
    return parents.length <= 1; // auto expand the first level
  }

  /**
   * Executes the fn on the nested keys and when expanded it's nested keys too until a fn() returns true
   * When no fn returned true, will return the total length
   */
  function walk(
    key: T,
    fn: (key: T, parents: T[], position: number) => false,
    parents?: T[],
    position?: number,
  ): number;
  function walk(
    key: T,
    fn: (key: T, parents: T[], position: number) => boolean,
    parents?: T[],
    position?: number,
  ): number | undefined;
  function walk(
    key: T,
    fn: (key: T, parents: T[], position: number) => boolean,
    parents: T[] = [],
    position = 0,
  ): number | undefined {
    if (getExpanded(key, parents) === true) {
      const count = getNestedCount(key);
      for (let i = 0; i < count; i++) {
        const nestedKey = getNestedKey(key, i);
        const nestedParents = [key, ...parents];
        if (fn(nestedKey, nestedParents, position)) {
          return undefined;
        }
        position += 1;
        const result = walk(nestedKey, fn, nestedParents, position);
        if (result === undefined) {
          return;
        }
        position = result;
      }
    }
    return position;
  }

  function getKeys(offset: number, count: number): Slice {
    const keys: T[] = [];
    parentsStore.clear();
    const total = walk(getRoot(), (key: T, parents: T[], position: number) => {
      if (position >= offset && position < offset + count) {
        parentsStore.set(key, parents);
        keys.push(key);
      }
      if (jumpToRef.key === key) {
        jumpToIndexRef.index = position;
        jumpToRef.key = undefined;
      }
      return false;
    });
    return { total, keys };
  }

  return virtualListController({
    ...props,
    itemSize: 20,
    variant: "striped",
    jumpToRef: jumpToIndexRef,
    getKeys,
    render(key) {
      const parents = parentsStore.get(key) ?? [];
      const depth = parents.length;
      const props: TreeViewRowProps = {
        indent: depth - 1,
        label: "",
        active: false,
        expanded: getExpanded(key, parents),
      };
      syncProps(key, props, parents);
      return defineUI({
        component: "TreeViewRow",
        props,
        slots: initSlots?.(key, parents),
        events: {
          onclick: () => activate?.(key),
          ondblclick: () => ondblclick?.(key),
          setExpanded(value) {
            expanded.set(key, value);
            return 1;
          },
          onkeydown(event) {
            let updateDepth = onkeydown?.(key, event);
            const parents = parentsStore.get(key);
            if (!parents) {
              return;
            }
            const parent = parents[0];
            const index = getIndex(parent, key);
            let targetKey: T | undefined;
            if (event.key === "ArrowUp") {
              if (index === 0) {
                targetKey = parent;
              } else {
                targetKey = getNestedKey(parent, index - 1);
              }
            } else if (event.key === "ArrowDown") {
              const count = getNestedCount(parent);
              if (index < count - 1) {
                targetKey = getNestedKey(parent, index + 1);
              } else {
                let next = false;
                walk(getRoot(), (branch) => {
                  if (next) {
                    targetKey = branch;
                    return true;
                  }
                  if (branch === key) {
                    next = true;
                  }
                  return false;
                });
              }
            } else if (event.key === "ArrowLeft") {
              if (parents !== undefined && getExpanded(key, parents)) {
                expanded.set(key, false);
                return 1;
              } else {
                targetKey = parent;
              }
            } else if (event.key === "ArrowRight") {
              const parents = parentsStore.get(key);
              if (
                parents !== undefined &&
                getExpanded(key, parents) === false
              ) {
                expanded.set(key, true);
                return 1;
              } else if (getNestedCount(key) > 0) {
                targetKey = getNestedKey(key, 0);
              }
            }
            if (targetKey && targetKey !== getRoot()) {
              focusRef.key = targetKey;
              jumpToRef.key = targetKey;
              activate?.(targetKey);
              updateDepth ??= 1;
            }
            return updateDepth;
          },
        },
        sync(patch) {
          const parents = parentsStore.get(key) ?? [];
          props.expanded = getExpanded(key, parents);
          syncProps(key, props, parents);

          if (key === focusRef.key) {
            patch.props = {
              ...props,
              autofocus: true,
            };
            focusRef.key = undefined;
          } else {
            patch.props = props;
          }
        },
      });
    },
  });
}
