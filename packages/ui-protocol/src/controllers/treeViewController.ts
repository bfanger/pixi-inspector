import { type UIProtocolInit } from "../svelte/defineUI";
import virtualListController from "./virtualListController";

type Trunk = typeof trunk;
const trunk = Symbol("trunk");

type TreeViewApi<T> = {
  getExpanded: (key: T, indent: number) => boolean | undefined;
  setExpanded: (key: T, expanded: boolean) => void;
};
type Options<T> = {
  buffer: number;
  itemSize: number;
  variant: "striped";
  getRoots: () => T[];
  getChildrenCount: (node: T) => number;
  getChild: (node: T, index: number) => T;
  render: (key: T, indent: number, api: TreeViewApi<T>) => UIProtocolInit;
};
export default function treeViewController<T extends WeakKey>(
  options: Options<T>,
) {
  const { getRoots, getChildrenCount, getChild, render, ...props } = options;
  const expanded = new WeakMap<T, boolean>();
  const indents = new WeakMap<T, number>();
  type Slice = { total: number; keys: T[] };
  const api: TreeViewApi<T> = {
    getExpanded(key: T, indent: number) {
      const value = expanded.get(key);
      if (value !== undefined) {
        return value;
      }
      if (getChildrenCount(key) === 0) {
        return undefined;
      }
      return indent < 2; // auto expand the first 2 levels
    },
    setExpanded(key, value) {
      expanded.set(key, value);
      return 1;
    },
  };

  function walk(
    node: T | Trunk,
    indent: number,
    collect: { from: number; till: number },
    out: Slice,
  ) {
    if (node === trunk) {
      for (const root of getRoots()) {
        walk(root, 0, collect, out);
      }
      return;
    }
    if (out.total >= collect.from && out.total < collect.till) {
      indents.set(node, indent);
      out.keys.push(node);
    }
    out.total += 1;
    if (api.getExpanded(node, indent) === true) {
      const count = getChildrenCount(node);
      for (let i = 0; i < count; i++) {
        walk(getChild(node, i), indent + 1, collect, out);
      }
    }
  }

  return virtualListController({
    ...props,
    getKeys(offset, count) {
      const slice: Slice = { total: 0, keys: [] };
      walk(trunk, 0, { from: offset, till: count + offset }, slice);
      return slice;
    },
    render(key) {
      return render(key, indents.get(key) ?? 0, api);
    },
  });
}
