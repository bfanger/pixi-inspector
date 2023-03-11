<script lang="ts">
  import Base from "./Base.svelte";
  import NumberInput from "./NumberInput.svelte";

  export let Hst: any;
  export let value = 123;
</script>

<Hst.Story>
  <Base>
    <div style="max-width: 200px;">
      <NumberInput bind:value location="TOP" />
      <NumberInput bind:value step={1} location="MIDDLE" />
      <NumberInput bind:value step={1} min={0} max={200} location="BOTTOM" />
    </div>
  </Base>
</Hst.Story>
