<script lang="ts">
  import Tree from "./Tree.svelte";
  import OutlinerRow from "blender-elements/src/OutlinerRow.svelte";
  import type { OutlinerNode } from "./types";

  type Props = {
    id: string;
    name: string;
    leaf: boolean;
    active: boolean;
    selectable: boolean;
    visible: boolean | undefined;
    match: boolean | undefined;
    muted?: boolean;
    parentUnselectable?: boolean | undefined;
    children?: OutlinerNode[] | undefined;
    depth?: number;
    onexpand: (path: string[]) => void;
    oncollapse: (path: string[]) => void;
    onactivate: (path: string[]) => void;
    onselectable: (path: string[]) => void;
    onunselectable: (path: string[]) => void;
    onshow: (path: string[]) => void;
    onhide: (path: string[]) => void;
    onlog: (path: string[]) => void;
    onmouseenter: (path: string[]) => void;
    onmouseleave: (path: string[]) => void;
  };

  let {
    id,
    name,
    leaf,
    active,
    selectable,
    visible,
    match,
    muted = false,
    parentUnselectable = undefined,
    children = undefined,
    depth = 0,
    onexpand,
    oncollapse,
    onactivate,
    onselectable,
    onunselectable,
    onshow,
    onhide,
    onlog,
    onmouseenter,
    onmouseleave,
  }: Props = $props();
</script>

<OutlinerRow
  indent={depth}
  title={name}
  {active}
  {selectable}
  {visible}
  {match}
  muted={visible === false || muted}
  parentUnselectable={parentUnselectable || !selectable}
  expanded={leaf ? undefined : !!children}
  onexpand={() => onexpand?.([id])}
  oncollapse={() => oncollapse?.([id])}
  onactivate={() => onactivate?.([id])}
  onselectable={() => onselectable?.([id])}
  onunselectable={() => onunselectable?.([id])}
  onshow={() => onshow?.([id])}
  onhide={() => onhide?.([id])}
  onlog={() => onlog?.([id])}
  onmouseenter={() => onmouseenter?.([id])}
  onmouseleave={() => onmouseleave?.([id])}
/>

{#if children}
  {#each children as child}
    <Tree
      id={child.id}
      name={child.name}
      leaf={child.leaf}
      active={child.active}
      selectable={child.selectable}
      parentUnselectable={parentUnselectable || !selectable}
      visible={child.visible}
      match={child.match}
      muted={visible === false || muted}
      children={child.children}
      depth={depth + 1}
      onexpand={(path) => onexpand([id, ...path])}
      oncollapse={(path) => oncollapse([id, ...path])}
      onactivate={(path) => onactivate([id, ...path])}
      onselectable={(path) => onselectable([id, ...path])}
      onunselectable={(path) => onunselectable([id, ...path])}
      onshow={(path) => onshow([id, ...path])}
      onhide={(path) => onhide([id, ...path])}
      onlog={(path) => onlog([id, ...path])}
      onmouseenter={(path) => onmouseenter([id, ...path])}
      onmouseleave={(path) => onmouseleave([id, ...path])}
    />
  {/each}
{/if}
