<script lang="ts">
  import Base from "../Base.svelte";
  import SearchField from "./SearchField.svelte";

  type Props = {
    Hst: any;
  };

  let { Hst }: Props = $props();

  let value = $state("");
</script>

<Hst.Story>
  <Base>
    <div style="max-width: 200px">
      <SearchField bind:value />
    </div>
  </Base>
  {#snippet controls()}
    <Hst.Text bind:value title="value" />
  {/snippet}
</Hst.Story>
