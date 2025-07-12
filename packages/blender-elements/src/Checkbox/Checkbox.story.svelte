<script lang="ts">
  import Base from "../Base.svelte";
  import Checkbox from "./Checkbox.svelte";

  type Props = {
    Hst: any;
  };

  let { Hst }: Props = $props();

  let value = $state(false);
  let viewports = $state(true);
  let renders = $state(true);
</script>

<Hst.Story>
  <Base>
    <Checkbox bind:value>Selectable</Checkbox>
    <Checkbox bind:value={viewports}>Viewports</Checkbox>
    <Checkbox
      value={renders}
      setValue={(checked) => {
        renders = checked;
      }}
    >
      Renders
    </Checkbox>
  </Base>
  {#snippet controls()}
    <Hst.Checkbox bind:value title="value" />
  {/snippet}
</Hst.Story>
