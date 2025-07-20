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
  const events: Record<string, (details?: TreeValue) => void> = {};
  if (init.events) {
    for (const event of init.events) {
      events[event] = (details?: TreeValue) => {
        node.sender.dispatchEvent(node, event, details);
      };
    }
  }
  const vdom = new VDOM();
  vdom.Component = component;

  const leaf: TreeDisplayLeafNode & { vdom: VDOM; sender: Sender } = {
    vdom,
    sender,
    path: init.path,

    setProps(props: TreeObjectValue) {
      if (init.value !== undefined || init.setValue) {
        vdom.props = {
          ...props,
          value: vdom.props.value,
          ...events,
        };
      } else {
        vdom.props = { ...props, ...events };
      }
    },
  };
  node = leaf;

  if (init.value !== undefined || init.setValue) {
    node.setValue = (value: TreeValue) => {
      vdom.props.value = value;
    };
    node.setValue(init.value);
    events.setValue ??= (value: TreeValue) => {
      node.sender.setValue(node, value);
    };
  }

  leaf.setProps(init.props);

  if (init.children === undefined) {
    return leaf;
  }
  vdom.children = [];
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
  node = container;
  return container;
}
