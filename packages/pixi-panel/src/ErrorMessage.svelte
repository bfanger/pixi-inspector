<div class="error"><slot /></div>

<style lang="scss">
  .error {
    background: #472722;
    color: #e1e1e1;
    padding: 2px 4px 4px 8px;
    position: relative;
    border: 1px solid #3d3d3d;
    border-radius: 3px;

    &::before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      width: 4px;
      height: 100%;
      background: #c1432a;
      color: #fefefe;
    }
  }
</style>
