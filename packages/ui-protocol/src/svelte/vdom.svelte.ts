import type { Component } from "svelte";
import type {
  Sender,
  TreeDisplayContainerNode,
  TreeDisplayLeafNode,
  TreeDisplayNode,
  TreeObjectValue,
  TreePatchInitDto,
  TreeValue,
} from "../types";
import components from "./components";
import throttle from "../throttle";
import debounce from "../debounce";

export class VDOM {
  Component: Component<any> = $state(undefined as any as Component<any>);
  children?: VDOM[] = $state();
  props: Record<string, any> = $state({});
}

export type SvelteNode = TreeDisplayNode & {
  vdom: VDOM;
  sender: Sender;
};
export function createChild(
  init: TreePatchInitDto,
  sender: Sender,
): SvelteNode {
  const component = components[init.component as keyof typeof components];
  if (!component) {
    throw new Error(`Component "${init.component}" is not available`);
  }
  let node: SvelteNode;

  const vdom = new VDOM();
  vdom.Component = component;

  const keys = new Set<string>(); // eslint-disable-line svelte/prefer-svelte-reactivity
  for (const key in init.props) {
    keys.add(key);
    vdom.props[key] = init.props[key];
  }
  if (init.events) {
    for (const config of init.events) {
      const handler = (details?: TreeValue) => {
        node.sender.dispatchEvent(node, config.event, details);
      };
      if (config.throttle) {
        vdom.props[config.event] = throttle(config.throttle, handler);
      } else if (config.debounce) {
        vdom.props[config.event] = debounce(config.debounce, handler);
      } else {
        vdom.props[config.event] = handler;
      }
    }
  }
  const leaf: TreeDisplayLeafNode & { vdom: VDOM; sender: Sender } = {
    vdom,
    sender,
    path: init.path,

    setProps(props: TreeObjectValue) {
      for (const key in props) {
        keys.add(key);
      }
      for (const key of keys) {
        vdom.props[key] = props[key];
      }
    },
  };
  node = leaf;

  if (init.value !== undefined || init.setValue) {
    vdom.props.value = init.value;
    node.setValue = (value: TreeValue) => {
      vdom.props.value = value;
    };
    node.setValue(init.value);
    vdom.props.setValue ??= (value: TreeValue) => {
      node.sender.setValue(node, value);
    };
  }

  leaf.setProps(init.props);

  if (init.children === undefined) {
    return leaf;
  }

  const container: TreeDisplayContainerNode & {
    vdom: VDOM & { children: VDOM[] };
    sender: Sender;
  } = {
    ...leaf,
    vdom: vdom as VDOM & { children: VDOM[] },
    children: [],
    setChild(index, childInit) {
      const child = createChild(childInit, container.sender);
      container.vdom.children[index] = child.vdom;
      return child;
    },
    truncate(length: number) {
      container.vdom.children.length = length;
    },
    sender,
  };
  container.children = init.children.map((childInit) =>
    createChild(childInit, container.sender),
  );
  vdom.children = container.children.map((child) => (child as SvelteNode).vdom);
  node = container;
  return container;
}
