<script lang="ts">
  export let label = "";
  let target = "";
  export { target as for };
</script>

<label class="label" for={target}>{label}</label>
<slot />

<style>
  .label {
    text-align: right;
    margin-right: 8px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    user-select: none;
  }
</style>
