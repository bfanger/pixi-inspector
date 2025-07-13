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
import NumberField from "../../../blender-elements/src/NumberField/NumberField.svelte";
import Container from "./Container.svelte";

export class VDOM {
  Component: Component<any> = $state(undefined as any as Component<any>);
  children?: VDOM[] = $state();
  props: Record<string, any> = $state({});
}

const configs = {
  Container: { component: Container },
  NumberField: {
    component: NumberField,
    dataProp: "value",
    setDataProp: "setValue",
  },
} as const;

export type SvelteNode = TreeDisplayNode & {
  vdom: VDOM;
  sender: Sender;
};
export function createChild(
  init: TreePatchInitDto,
  sender: Sender,
): SvelteNode {
  const config = configs[init.component as keyof typeof configs];
  if (!config) {
    throw new Error(
      `No configuration available for Component: ${init.component}.`,
    );
  }
  let node: SvelteNode;
  const events: Record<string, any> = {};
  if ("setDataProp" in config) {
    events[config.setDataProp] = (value: TreeValue) => {
      node.sender.setData(node, value);
    };
  }

  const vdom = new VDOM();
  vdom.Component = config.component;

  const leaf: TreeDisplayLeafNode & { vdom: VDOM; sender: Sender } = {
    vdom,
    sender,
    path: init.path,
    setProps(props: TreeObjectValue) {
      if ("dataProp" in config) {
        vdom.props = {
          ...props,
          ...events,
          [config.dataProp]: vdom.props[config.dataProp],
        };
      } else {
        vdom.props = { ...props, ...events };
      }
    },
  };
  node = leaf;

  if ("dataProp" in config) {
    node.setData = (value: TreeValue) => {
      vdom.props[config.dataProp] = value;
    };
    node.setData(init.data);
  } else if (init.data !== undefined) {
    throw new Error("init with data failed: No dataProp configured");
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
