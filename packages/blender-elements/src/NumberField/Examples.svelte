<script lang="ts">
  import Panel from "../Panel/Panel.svelte";
  import Property from "../Property/Property.svelte";
  import PropertyGroup from "../Property/PropertyGroup.svelte";
  import NumberField from "./NumberField.svelte";

  let x = $state(123);
  let y = $state(456);
  let z = $state(789);
</script>

<div style="max-width: 250px;">
  <Panel title="Buttons in a group">
    <PropertyGroup>
      <Property label="Location X">
        <NumberField
          value={x}
          step={0.1}
          setValue={(val) => {
            x = val;
          }}
          rounded="top"
        />
      </Property>
      <Property label="Y">
        <NumberField bind:value={y} rounded="none" />
      </Property>
      <Property label="Z">
        <NumberField
          bind:value={z}
          step={1}
          min={500}
          max={1000}
          rounded="bottom"
        />
      </Property>
    </PropertyGroup>
  </Panel>
</div>
