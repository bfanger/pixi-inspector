<script lang="ts">
  import type { Connection } from "../types";
  import createSender from "../createSender";
  import VDOMNode from "./VDOMNode.svelte";
  import { onMount } from "svelte";
  import { createChild } from "./vdom.svelte";
  import Base from "blender-elements/src/Base.svelte";

  type Props = {
    connection: Connection;
    onerror: (error: Error) => void;
  };

  let { connection, onerror }: Props = $props();

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
  const sender = createSender(tree, connection, onerror);
  tree.sender = sender;

  onMount(() => {
    let destroyed = false;
    sender.reset().then(() => {
      if (!destroyed) {
        sender.sync();
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

<Base>
  <VDOMNode vdom={tree.vdom} />
</Base>
