<script lang="ts">
  import { getTriggerContext } from "./TriggerProvider.svelte";

  type Props = { event?: unknown };
  let { event }: Props = $props();

  const dispatch = getTriggerContext();

  $effect(() => {
    dispatch(event);
  });
</script>
