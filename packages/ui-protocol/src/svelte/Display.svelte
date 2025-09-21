<script lang="ts">
  import type { Connection } from "../types";
  import createSender from "../createSender";
  import VDOMNode from "./VDOMNode.svelte";
  import { onMount } from "svelte";
  import { createChild } from "./vdom.svelte";
  import Base from "blender-elements/src/Base.svelte";

  type Props = {
    connection: Connection;
    ondisconnect: () => void;
  };

  let { connection, ondisconnect }: Props = $props();

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
  const sender = createSender(tree, connection);
  tree.sender = sender;

  let timer: ReturnType<typeof setTimeout>;
  async function poll() {
    try {
      await sender.sync();
      timer = setTimeout(() => requestAnimationFrame(poll), 1_000);
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

<Base>
  <VDOMNode vdom={tree.vdom} />
</Base>
