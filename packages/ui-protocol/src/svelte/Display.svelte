<script lang="ts">
  import type { Connection } from "../types";
  import createSender from "../createSender";
  import VDOMNode from "./VDOMNode.svelte";
  import { onMount } from "svelte";
  import { createChild } from "./vdom.svelte";
  import Base from "blender-elements/src/Base.svelte";

  type Props = {
    connection: Connection;
    base?: boolean;
    onerror: (error: Error) => void;
  };

  let { connection, base = false, onerror }: Props = $props();

  let tree = $derived.by(() => {
    let tree = createChild(
      {
        path: [],
        component: "Fragment",
        props: {},
        children: [],
      },
      {
        dispatchEvent: senderError,
        setValue: senderError,
        sync: senderError,
        reset: senderError,
      },
    );
    tree.sender = createSender(tree, connection, onerror);
    return tree;
  });

  onMount(() => {
    let destroyed = false;
    tree.sender.reset().then(() => {
      if (!destroyed) {
        tree.sender.sync();
      }
    });
    return () => {
      destroyed = false;
    };
  });

  function senderError(): never {
    throw new Error("sender not yet injected");
  }
</script>

{#if base}
  <Base>
    <VDOMNode vdom={tree.vdom} />
  </Base>
{:else}
  <VDOMNode vdom={tree.vdom} />
{/if}
