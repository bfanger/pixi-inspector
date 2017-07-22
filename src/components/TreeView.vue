<template>
  <div class="treeview" tabindex="1" @keydown.right.prevent="navigateRight" @keydown.left.prevent="navigateLeft" @keydown.up.prevent="navigateUp" @keydown.down.prevent="navigateDown">
    <div v-for="row in rows" class="treeview__item" :key="row.node.id" :class="{'treeview__item--selected': selected && row.node.id === selected.id}" :data-id="row.node.id" @mousedown="select(row.node)" @mouseenter="highlight(row.node)" @mouseleave="highlight(false)">
      <div class="treeview__indent" :style="{width: (row.indent * 14)  + 'px'}"></div>
      <div class="treeview__toggle">
        <div class="treeview__toggle__expand" v-if="row.node.children && row.node.collapsed" @click="expand(row.node)"></div>
        <div class="treeview__toggle__collapse" v-if="row.node.children && !row.node.collapsed" @click="collapse(row.node)"></div>
      </div>
      <div class="treeview__label">{{row.node.type}}</div>
    </div>
  </div>
</template>

<script>
import lastestInspector$ from '../services/lastestInspector$'

export default {

  subscriptions () {
    const inspector$ = lastestInspector$.filter(inspector => inspector !== null)
    return {
      selected: inspector$.switchMap(inspector => inspector.selected$),
      rows: inspector$.switchMap(inspector => inspector.tree$.map(this.flattenTree)),
      select: lastestInspector$.method('select'),
      expand: lastestInspector$.method('expand'),
      collapse: lastestInspector$.method('collapse'),
      highlight: lastestInspector$.method('highlight')
    }
  },
  methods: {
    flattenTree (tree) {
      const rows = []
      if (Array.isArray(tree.children)) {
        for (const node of tree.children) {
          this.flattenNode(node, rows, 0)
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
      rows.push({ indent, node })
      indent++
      if (!node.collapsed && node.children) {
        for (const subnode of node.children) {
          this.flattenNode(subnode, rows, indent)
        }
      }
    },

    navigateUp () {
      const index = this.findRowIndex(this.selected.id)
      if (index > 0) {
        this.select(this.rows[index - 1].node)
      }
    },
    navigateRight () {
      const index = this.findRowIndex(this.selected.id)
      const row = this.rows[index]
      if (row.node.collapsed) {
        this.expand(row.node)
      } else if (index < this.rows.length - 1) {
        this.select(this.rows[index + 1].node)
      }
    },

    navigateDown () {
      const index = this.findRowIndex(this.selected.id)
      if (index < this.rows.length - 1) {
        this.select(this.rows[index + 1].node)
      }
    },
    navigateLeft () {
      const index = this.findRowIndex(this.selected.id)
      const row = this.rows[index]
      if (!row.node.collapsed) {
        this.collapse(row.node)
      } else if (index > 0) {
        const parentIndex = this.findRowIndex(row.node.parent)
        this.select(this.rows[parentIndex].node)
      }
    },
    findRowIndex (id) {
      for (const i in this.rows) {
        if (this.rows[i].node.id === id) {
          return parseInt(i)
        }
      }
      return -1
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
