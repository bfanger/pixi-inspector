<script lang="ts" module>
  const [getTriggerContext, setTriggerContext] =
    createContext<(data: unknown) => void>();
  export { getTriggerContext };
</script>

<script lang="ts">
  import { createContext, type Snippet } from "svelte";

  type Props = {
    ontrigger: (data: unknown) => void;
    children: Snippet;
  };
  let { ontrigger, children }: Props = $props();
  setTriggerContext((data) => ontrigger(data));
</script>

{@render children()}
