<script lang="ts">
  import Base from "../Base.svelte";
  import SearchInput from "./SearchInput.svelte";

  export let Hst: any;

  let value = "";
</script>

<Hst.Story>
  <Base>
    <div style="max-width: 200px">
      <SearchInput bind:value />
    </div>
  </Base>
  <svelte:fragment slot="controls">
    <Hst.Text bind:value title="value" />
  </svelte:fragment>
</Hst.Story>
