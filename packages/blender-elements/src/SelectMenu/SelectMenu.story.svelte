<script lang="ts">
  import Base from "../Base.svelte";
  import SelectMenu from "./SelectMenu.svelte";

  type Props = {
    Hst: any;
  };

  let { Hst }: Props = $props();

  let value = $state("Both");
  const options = ["None", "Back", "Front", "Both"];
</script>

<Hst.Story>
  <Base>
    <div style="max-width: 200px">
      <SelectMenu legend="Fill Mode" bind:value {options} />
    </div>
  </Base>
  {#snippet controls()}
    <Hst.Select
      bind:value
      title="value"
      options={["None", "Back", "Front", "Both"]}
    />
  {/snippet}
</Hst.Story>
