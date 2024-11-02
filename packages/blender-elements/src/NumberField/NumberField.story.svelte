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
        onchange={(val) => {
          value = val;
        }}
        location="TOP"
      />
      <NumberField bind:value step={1} location="MIDDLE" />
      <NumberField bind:value step={1} min={0} max={200} location="BOTTOM" />
    </div>
  </Base>
  {#snippet controls()}
    <Hst.Text bind:value title="value" />
  {/snippet}
</Hst.Story>
