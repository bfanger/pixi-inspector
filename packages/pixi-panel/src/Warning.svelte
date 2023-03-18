<script lang="ts">
  export let icon: "warning" | "error" = "warning";
  export let message = "";
</script>

<div class="warning" data-icon={icon}>
  {message}<slot />
</div>

<style lang="scss">
  .warning {
    background: #472722;
    color: #e1e1e1;
    padding: 2px 4px 4px 30px;
    position: relative;
    border: 1px solid #3d3d3d;
    border-radius: 3px;
    overflow: hidden;
    min-height: 16px;

    &::before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      width: 24px;
      height: 100%;
      background: #c1432a center center no-repeat;
    }
    &[data-icon="warning"]::before {
      background-image: var(--icon-warning);
    }
    &[data-icon="error"]::before {
      background-image: var(--icon-error);
    }
  }
</style>
