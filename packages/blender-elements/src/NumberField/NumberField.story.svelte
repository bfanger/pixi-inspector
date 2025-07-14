<script lang="ts">
  import Base from "../Base.svelte";
  import NumberField from "./NumberField.svelte";

  type Props = {
    Hst: any;
    value?: number;
  };

  let { Hst, value = $bindable(123) as number | undefined }: Props = $props();
</script>

<Hst.Story>
  <Base>
    <div style="max-width: 200px;">
      <NumberField
        {value}
        setValue={(val) => {
          value = val;
        }}
        location="top"
      />
      <NumberField bind:value step={1} location="middle" />
      <NumberField bind:value step={1} min={0} max={200} location="bottom" />
    </div>
  </Base>
  {#snippet controls()}
    <Hst.Text bind:value title="value" />
  {/snippet}
</Hst.Story>
