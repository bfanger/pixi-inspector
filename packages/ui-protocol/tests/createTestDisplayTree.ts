import { TreeDisplayNode, TreePatchInitDto } from "../src/types";

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
    component: "Container",
    props: {},
    data: null,
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
    setData(data) {
      this.test.data = data;
    },
    truncate() {},
  };
}
