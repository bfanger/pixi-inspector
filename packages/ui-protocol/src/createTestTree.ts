import { TreeDisplayNode, TreePatchInitDto } from "./types";

type TestNode = TreeDisplayNode & {
  test: Omit<TreePatchInitDto, "children">;
  children?: TestNode[];
};
export default function createTestTree() {
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
  ...init
}: TreePatchInitDto): TestNode {
  return {
    test: {
      ...init,
    },
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
