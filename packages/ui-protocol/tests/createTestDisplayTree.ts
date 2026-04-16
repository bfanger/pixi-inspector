import type { TreeDisplayNode, TreePatchInitDto } from "../src/types";

/**
 * Instead of updating a visual component, update the values inside the test property
 */
type TestNode = TreeDisplayNode & {
  test: Omit<TreePatchInitDto, "slots" | "path">;
  slots?: { children?: TestNode[] };
};
export default function createTestDisplayTree() {
  return createTestDisplayNode({
    path: [],
    component: "Fragment",
    props: {},
    value: null,
    slots: { children: [] },
  });
}

function createTestDisplayNode({
  slots,
  path,
  ...init
}: TreePatchInitDto): TestNode {
  return {
    test: {
      ...init,
    },
    path,
    createNode(_slot, _index, init) {
      return createTestDisplayNode(init);
    },
    setProps(props) {
      this.test.props = props;
    },
    setValue(data) {
      this.test.value = data;
    },
    truncate() {},
    ...(!slots?.children
      ? {}
      : {
          slots: {
            children: slots?.children?.map(createTestDisplayNode),
          },
        }),
  };
}
