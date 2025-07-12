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
  const events: Record<string, any> = {};

  const vdom = new VDOM();
  vdom.Component = config.component;

  const leaf: TreeDisplayLeafNode & { vdom: VDOM; sender: Sender } = {
    vdom,
    sender,
    path: init.path,
    setProps(props: TreeObjectValue) {
      if ("dataProp" in config) {
        vdom.props = {
          [config.dataProp]: vdom.props[config.dataProp],
          ...props,
          ...events,
        };
      } else {
        vdom.props = { ...props, ...events };
      }
    },
    setData(value: TreeValue) {
      if ("dataProp" in config) {
        vdom.props[config.dataProp] = value;
      } else {
        throw new Error("setData failed: No dataProp configured");
      }
    },
  };
  if ("dataProp" in config) {
    leaf.setData(init.data);
  }
  if ("setDataProp" in config) {
    events[config.setDataProp] = (value: TreeValue) => {
      leaf.sender.setData(leaf, value);
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
    setChild(index, child) {
      const node = createChild(child, container.sender);
      container.vdom.children[index] = node.vdom;
      return node;
    },
    truncate(length: number) {
      container.vdom.children.length = length;
    },
    sender,
  };

  return container;
}
