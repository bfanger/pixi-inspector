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
  lookup: (key: T) => { parent: T; index: number } | undefined;
  getLabel: (key: T) => string;
  getActive: (key: T) => boolean | undefined;
  activate?: (key: T) => void;
  ondblclick?: (key: T) => number | undefined;
  initSlots?: (key: T) => Record<string, UIProtocolInit[]> | undefined;
};
export default function treeViewController<T extends WeakKey>(
  options: Options<T>,
) {
  const {
    getRoot,
    getNestedCount,
    getNestedKey,
    lookup,
    getLabel,
    getActive,
    jumpToRef: jumpToRefProp,
    focusRef: focusRefProp,
    activate,
    ondblclick,
    initSlots,
    ...props
  } = options;
  const depths = new WeakMap<T, number>();
  const jumpToIndexRef = { index: undefined as number | undefined };
  type Slice = { total: number; keys: T[] };
  const jumpToRef = jumpToRefProp ?? { key: undefined };
  const focusRef = focusRefProp ?? { key: undefined };
  const expanded = new WeakMap<T, boolean>();

  function getExpanded(key: T, depth: number) {
    const value = expanded.get(key);
    if (value !== undefined) {
      return value;
    }
    if (getNestedCount(key) === 0) {
      return undefined;
    }
    return depth <= 1; // auto expand the first level
  }

  /**
   * Executes the fn on the nested keys and when expanded it's nested keys too until a fn() returns true
   * When no fn returned true, will return the total length
   */
  function walk(
    key: T,
    fn: (key: T, depth: number, position: number) => false,
    depth?: number,
    position?: number,
  ): number;
  function walk(
    key: T,
    fn: (key: T, depth: number, position: number) => boolean,
    depth?: number,
    position?: number,
  ): number | undefined;
  function walk(
    key: T,
    fn: (key: T, depth: number, position: number) => boolean,
    depth = 0,
    position = 0,
  ): number | undefined {
    if (getExpanded(key, depth) === true) {
      const count = getNestedCount(key);
      for (let i = 0; i < count; i++) {
        const nestedKey = getNestedKey(key, i);
        if (fn(nestedKey, depth + 1, position)) {
          return undefined;
        }
        position += 1;
        const result = walk(nestedKey, fn, depth + 1, position);
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
    const total = walk(getRoot(), (key: T, depth: number, position: number) => {
      if (position >= offset && position < offset + count) {
        depths.set(key, depth);
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
      const depth = depths.get(key) ?? 0;
      const props: TreeViewRowProps = {
        indent: depth - 1,
        label: getLabel(key),
        active: getActive(key),
        expanded: getExpanded(key, depth),
      };
      return defineUI({
        component: "TreeViewRow",
        props,
        slots: initSlots?.(key),
        events: {
          onclick() {
            if (activate) {
              activate(key);
              return 1;
            }
          },
          ondblclick: () => ondblclick?.(key),
          setExpanded(value) {
            expanded.set(key, value);
            return 1;
          },
          onkeydown(event) {
            const found = lookup(key);
            if (!found) {
              return;
            }
            let targetKey: T | undefined;
            if (event.key === "ArrowUp") {
              if (found.index === 0) {
                targetKey = found.parent;
              } else {
                targetKey = getNestedKey(found.parent, found.index - 1);
              }
            } else if (event.key === "ArrowDown") {
              const count = getNestedCount(found.parent);
              if (found.index < count - 1) {
                targetKey = getNestedKey(found.parent, found.index + 1);
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
              const depth = depths.get(key);
              if (depth !== undefined && getExpanded(key, depth)) {
                expanded.set(key, false);
                return 1;
              } else {
                targetKey = found.parent;
              }
            } else if (event.key === "ArrowRight") {
              const depth = depths.get(key);
              if (depth !== undefined && getExpanded(key, depth) === false) {
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
              return 1;
            }
          },
        },
        sync(patch) {
          props.expanded = getExpanded(key, depth);
          props.active = getActive(key);
          props.label = getLabel(key);

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
