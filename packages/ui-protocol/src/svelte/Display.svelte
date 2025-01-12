<script lang="ts">
  import type {
    TreeEvent,
    TreePatchDataDto,
    TreePatchDto,
    TreePath,
  } from "../types";
  import createSender from "../createSender";
  import VDOMNode from "./VDOMNode.svelte";
  import { onMount, type Component } from "svelte";
  import { createChild } from "./vdom.svelte";

  type Props = {
    updateFn: (
      data: TreePatchDataDto[],
      event?: TreeEvent,
    ) => Promise<TreePatchDto>;
    syncFn: (data: TreePatchDataDto[], path: TreePath) => Promise<TreePatchDto>;
    Fallback?: Component;
  };

  let { updateFn, syncFn, Fallback }: Props = $props();

  const tree = createChild({
    path: [],
    data: null,
    component: "Container",
    props: {},
    children: [],
  });

  const sender = createSender(tree, updateFn, syncFn);

  onMount(() => {
    let timer: ReturnType<typeof setTimeout>;
    async function poll() {
      await sender.sync();
      timer = setTimeout(poll, 1000);
    }
    poll();
    return () => clearTimeout(timer);
  });
</script>

{#if Fallback && !tree.vdom.children?.length}
  <Fallback />
{/if}
<VDOMNode vdom={tree.vdom} />
