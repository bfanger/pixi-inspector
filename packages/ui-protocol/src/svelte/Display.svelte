<script lang="ts">
  import type { Connection } from "../types";
  import createSender from "../createSender";
  import VDOMNode from "./VDOMNode.svelte";
  import { onMount, type Component } from "svelte";
  import { createChild } from "./vdom.svelte";

  type Props = {
    connection: Connection;
    ondisconnect: () => void;
    Fallback?: Component;
  };

  let { connection, ondisconnect, Fallback }: Props = $props();

  let tree = createChild(
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
      reset: senderError,
    },
  );
  const sender = createSender(tree, connection);
  tree.sender = sender;

  let timer: ReturnType<typeof setTimeout>;
  async function poll() {
    try {
      await sender.sync();
      timer = setTimeout(poll, 1_000);
    } catch (err) {
      console.warn(new Error("sender.sync() failed", { cause: err }));
      ondisconnect();
    }
  }

  onMount(() => {
    let destroyed = false;
    sender.reset().then(() => {
      if (!destroyed) {
        poll();
      }
    });
    return () => {
      destroyed = false;
      clearTimeout(timer);
    };
  });

  function senderError(): never {
    throw new Error("sender not yet injected");
  }
</script>

{#if tree}
  {#if Fallback && !tree.vdom.children?.length}
    <Fallback />
  {/if}
  <VDOMNode vdom={tree.vdom} />
{/if}
