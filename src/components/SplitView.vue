<script>
export default {
  methods: {
    children() {
      if (!this.$slots.default) {
        return [];
      }
      return this.$slots.default.filter(vnode => {
        if (typeof vnode.tag === "undefined" && vnode.text === " ") {
          return false;
        }
        return true;
      });
    }
  },
  render() {
    const items = this.children().map(vnode => (
      <div class="splitview__item">{vnode}</div>
    ));
    return <div class="splitview">{items}</div>;
  }
};
</script>

<style lang="scss">
.splitview {
  display: flex;
}

.splitview__item {
  flex: 1;
  overflow: auto; // max-height: 100%;
  &:not(:first-child) {
    border-left: 1px solid #ccc;
  }
}
</style>
