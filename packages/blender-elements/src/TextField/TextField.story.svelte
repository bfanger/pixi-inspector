<script lang="ts">
  import Base from "../Base.svelte";
  import TextField from "./TextField.svelte";

  type Props = {
    Hst: any;
  };

  let { Hst }: Props = $props();

  let value = $state("");
</script>

<Hst.Story>
  <Base>
    <div style="max-width: 200px">
      <TextField bind:value />
    </div>
  </Base>
  {#snippet controls()}
    <Hst.Text bind:value title="value" />
  {/snippet}
</Hst.Story>
