import type { UIProtocolInit } from "./svelte/defineUI";
import defineUI from "./svelte/defineUI";

type PanelInit = Extract<UIProtocolInit, { component: "Panel" }>;

export default function collapsiblePanelNode(
  options: Omit<NonNullable<PanelInit["props"]>, "expanded" | "content"> & {
    expanded?: boolean;
    setExpanded?: (expanded: boolean) => void;
  },
  child: () => UIProtocolInit,
) {
  const { expanded: initial, setExpanded, ...initialProps } = options;
  let expanded = initial ?? true;
  let content = expanded;

  return defineUI({
    component: "Panel",
    props: {
      ...initialProps,
      expanded,
      content,
    },
    children: content ? [child()] : [],
    events: {
      setContent(value) {
        content = value;
      },
      setExpanded(value) {
        expanded = value;
        setExpanded?.(expanded);
      },
    },
    sync(patch) {
      if (content && this.slots!.children.length === 0) {
        patch.appends.push(child());
        patch.props = { ...initialProps, expanded, content: true };
      } else if (!content && this.slots!.children.length !== 0) {
        patch.truncate.children = 0;
        patch.props = { ...initialProps, expanded, content: false };
      }
    },
  });
}
