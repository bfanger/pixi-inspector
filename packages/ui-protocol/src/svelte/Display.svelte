<script lang="ts">
  import type { Connection } from "../types";
  import createSender from "../createSender";
  import VDOMNode from "./VDOMNode.svelte";
  import { onMount, type Component } from "svelte";
  import { createChild } from "./vdom.svelte";

  type Props = {
    connection: Connection;
    Fallback?: Component;
  };

  let { connection, Fallback }: Props = $props();

  const tree = createChild(
    {
      path: [],
      component: "Container",
      props: {},
      children: [],
    },
    {
      dispatchEvent: senderError,
      setData: senderError,
      sync: senderError,
    },
  );
  const sender = createSender(tree, connection);
  tree.sender = sender;

  onMount(() => {
    let timer: ReturnType<typeof setTimeout>;
    async function poll() {
      await sender.sync();
      timer = setTimeout(poll, 1_000);
    }
    poll();
    return () => clearTimeout(timer);
  });

  function senderError(): never {
    throw new Error("sender not yet injected");
  }
</script>

{#if Fallback && !tree.vdom.children?.length}
  <Fallback />
{/if}
<VDOMNode vdom={tree.vdom} />
