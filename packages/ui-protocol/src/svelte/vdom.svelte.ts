import type { Component, Snippet } from "svelte";
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
import { snippet } from "./VDOMNode.svelte";

export class VDOM {
  Component: Component<any> = $state(undefined as any as Component<any>);
  props: Record<string, any> = $state({});
  slots: Record<string, VDOM[]> = $state({});
}

export type SvelteNode = TreeDisplayNode & {
  vdom: VDOM;
  sender: Sender;
};
export function createSvelteNode(
  init: TreePatchInitDto,
  sender: Sender,
): SvelteNode {
  const component = components[init.component as keyof typeof components];
  if (!component) {
    if (!components["Warning"]) {
      throw new Error(`Component "${init.component}" is not registered`);
    }
    return createSvelteNode(
      {
        ...init,
        component: "Warning",
        props: { message: `Component "${init.component}" was not registered` },
      },
      sender,
    );
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
      const handler = (...args: TreeValue[]) => {
        node.sender.dispatchEvent(node, config.event, ...args);
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
    vdom.props.setValue ??= (value: TreeValue) => {
      node.sender.setValue(node, value);
    };
  }

  leaf.setProps(init.props);

  if (init.slots === undefined) {
    return leaf;
  }

  const container: TreeDisplayContainerNode & {
    vdom: VDOM;
    sender: Sender;
  } = {
    ...leaf,
    vdom,
    slots: {},
    createNode(slot, index, nestedInit) {
      const subnode = createSvelteNode(nestedInit, container.sender);
      container.vdom.slots[slot][index] = subnode.vdom;
      return subnode;
    },
    truncate(slot, length) {
      container.vdom.slots[slot].length = length;
    },
    sender,
  };

  for (const [slot, nestedInits] of Object.entries(init.slots)) {
    container.vdom.slots[slot] = [];
    container.slots[slot] = nestedInits.map((nestedInit, index) => {
      const subnode = createSvelteNode(nestedInit, container.sender);
      container.vdom.slots[slot][index] = subnode.vdom;
      return subnode;
    });

    vdom.props[slot] = (node: HTMLElement) =>
      (
        snippet as any as (
          node: HTMLElement,
          getter: () => Parameters<typeof snippet>[0],
        ) => ReturnType<Snippet>
      )(node, () => vdom.slots[slot]);
  }

  if (init.component === "ErrorBoundary") {
    vdom.props.createTrigger = (setError: (message?: string) => void) => {
      container.setError = setError;
    };
  }
  node = container;
  return container;
}
