<template>
  <div class="treeview"
       tabindex="1"
       @keydown.right.prevent="navigateRight"
       @keydown.left.prevent="navigateLeft"
       @keydown.up.prevent="navigateUp"
       @keydown.down.prevent="navigateDown">

<!-- @mouseenter="inspector.highlight(node.id)"
         @mouseleave="inspector.highlight(false)"
         -->
    <div v-for="row in rows()"
         class="treeview__item"
         :key="row.node.id"
         :class="{'treeview__item--selected': row.node.selected}"
         :data-id="row.node.id"
          @mousedown="inspector.select(node)">
      <div class="treeview__indent"
           :style="{width: (row.indent * 14)  + 'px'}"></div>
      <div class="treeview__toggle">
        <div class="treeview__toggle__expand"
             v-if="row.node.children && row.node.collapsed"
             @click="inspector.expand(row.node)"></div>
        <div class="treeview__toggle__collapse"
             v-if="row.node.children && !row.node.collapsed"
             @click="inspector.collapse(row.node)"></div>
      </div>
      {{row.node.type}}
    </div>
  </div>
</template>

<script>
// var KEYS = {
//   LEFT: 37,
//   UP: 38,
//   RIGHT: 39,
//   DOWN: 40
// }
export default {
  props: {
    inspector: Object
  },
  // async mounted () {
  // this.tree = await this.inspector.tree()
  // console.log('mounted', this.tree)
  // this.tree.children.map(node => console.log('node', node.id))
  // await Promise.all(this.inspector.expand(node.id)))
  // setTimeout(function () {
  // await this.inspector.tree()
  // })
  // },
  methods: {
    rows () {
      const rows = []
      if (this.inspector.tree.children) {
        for (const container of this.inspector.tree.children) {
          this.flattenNode(container, rows, 0)
        }
      }
      return rows
    },
    flattenNode (node, rows, indent) {
      // let title = node.type
      // if (typeof node.name !== 'undefined' && node.name !== null && node.name !== '') {
      //   if (node.type === 'Unknown') {
      //     title = node.name
      //   } else {
      //     title = node.type + ' (' + node.name + ')'
      //   }
      // }
      // if (title === '') {
      //   title = 'unknown'
      // }
      // const selected = false
      // if (this.selected && this.selected._inspector) {
      //   selected = node.id === this.selected._inspector.id
      // }
      rows.push({ indent, node })
      indent++
      if (!node.collapsed && node.children) {
        for (const subnode of node.children) {
          this.flattenNode(subnode, rows, indent)
        }
      }
    },
    select (id) {
      // this.inspector.select(id)
    },
    navigateLeft () {
      // const node = this.selected._inspector
      // if (!node.collapsed) {
      //   this.inspector.collapse(node.id)
      // } else if (this.context.parent) {
      //   this.inspector.select(this.context.parent)
      //   this.inspector.highlight(this.context.parent)
      // }
    },
    navigateRight () {
      // const node = this.selected._inspector
      // if (node.collapsed) {
      //   this.inspector.expand(node.id)
      // } else if (this.context.next) {
      //   this.inspector.select(this.context.next)
      //   this.inspector.highlight(this.context.next)
      // }
    },
    navigateUp () {
      // if (this.context.prev) {
      //   this.inspector.select(this.context.prev)
      //   this.inspector.highlight(this.context.prev)
      // }
    },
    navigateDown () {
      // if (this.context.next) {
      //   this.inspector.select(this.context.next)
      //   this.inspector.highlight(this.context.next)
      // }
    }
  }
}
</script>

<style lang="scss">
.treeview {
  padding: 4px 0
}

.treeview__item {
  color: #808;
  padding: 1px;
  display: flex;
  user-select: none;
}

.treeview__toggle {
  position: relative;
  width: 12px;
  height: 12px;
}

.treeview__toggle__expand {
  border: 4px solid transparent;
  border-left-color: #6e6e6e;
  border-left-width: 6px;
  position: absolute;
  top: 2px;
  left: 4px;
}

.treeview__toggle__collapse {
  border: 4px solid transparent;
  border-top-color: #6e6e6e;
  border-top-width: 6px;
  position: absolute;
  top: 3px;
  left: 2px;
}

.treeview__item--hovered,
.treeview__item:hover:not(.treeview__item--selected) {
  background: #eaf1fb;
}

.treeview__item--selected {
  background: #d4d4d4;
}

.treeview:focus {
  outline: none;

  .treeview__item--selected {
    background: #3879d9;
    color: white;

    .treeview__toggle__collapse {
      border-top-color: white;
    }
    .treeview__toggle__expand {
      border-left-color: white;
    }
  }
}
</style>
