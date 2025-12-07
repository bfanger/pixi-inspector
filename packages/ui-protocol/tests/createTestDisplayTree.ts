import type { TreeDisplayNode, TreePatchInitDto } from "../src/types";

/**
 * Instead of updating a visual component, update the values inside the test property
 */
type TestNode = TreeDisplayNode & {
  test: Omit<TreePatchInitDto, "children" | "path">;
  children?: TestNode[];
};
export default function createTestDisplayTree() {
  return createTestDisplayNode({
    path: [],
    component: "Fragment",
    props: {},
    value: null,
    children: [],
  });
}

function createTestDisplayNode({
  children,
  path,
  ...init
}: TreePatchInitDto): TestNode {
  return {
    test: {
      ...init,
    },
    path,
    children: children?.map(createTestDisplayNode) as TestNode[],
    setChild(_, init) {
      return createTestDisplayNode(init);
    },
    setProps(props) {
      this.test.props = props;
    },
    setValue(data) {
      this.test.value = data;
    },
    truncate() {},
  };
}
