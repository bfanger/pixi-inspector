<script lang="ts">
  import Panel from "../Panel/Panel.svelte";
  import Property from "../Property/Property.svelte";
  import Box from "../Box/Box.svelte";
  import NumberInput from "./NumberInput.svelte";

  let x = $state(123);
  let y = $state(456);
  let z = $state(789);
</script>

<div style="max-width: 250px;">
  <Panel title="NumberInput in a group">
    <Box gap={1} padding={8}>
      <Property label="Location X">
        <NumberInput
          value={x}
          step={0.1}
          setValue={(val) => {
            x = val;
          }}
          rounded="top"
        />
      </Property>
      <Property label="Y">
        <NumberInput bind:value={y} rounded="none" />
      </Property>
      <Property label="Z">
        <NumberInput
          bind:value={z}
          step={1}
          min={500}
          max={1000}
          rounded="bottom"
        />
      </Property>
    </Box>
  </Panel>
</div>
