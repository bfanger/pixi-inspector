<script lang="ts">
  import { onMount } from "svelte";
  import { getTriggerContext } from "./TriggerProvider.svelte";

  type Props = { data?: unknown };
  let { data }: Props = $props();

  const dispatch = getTriggerContext();

  onMount(() => {
    dispatch(data);
  });
</script>
