<template>
	<div
		class="treeview"
		tabindex="1"
		@keydown.right.prevent="navigateRight"
		@keydown.left.prevent="navigateLeft"
		@keydown.up.prevent="navigateUp"
		@keydown.down.prevent="navigateDown">

		<div
			v-for="node in nodes()"
			:key="node.id"
			class="treeview__item"
			:class="{'treeview__item--selected': node.selected}"
			@mouseenter="inspector.highlight(node.id)"
			@mouseleave="inspector.highlight(false)"
			@mousedown="select(node.id)"
			:data-id="node.id">
			<div class="treeview__indent" :style="{width: (node.indent * 14)  + 'px'}"></div>
			<div class="treeview__toggle">
				<div class="treeview__toggle__expand" v-if="!node.leaf && node.collapsed" @click="inspector.expand(node.id)"></div>
				<div class="treeview__toggle__collapse" v-if="!node.leaf && !node.collapsed" @click="inspector.collapse(node.id)"></div>
			</div>
			{{node.title}}
		</div>
	</div>
</template>

<script>
var KEYS = {
	LEFT: 37,
	UP: 38,
	RIGHT: 39,
	DOWN: 40
}
export default {
	props: {
		scene: Object,
		inspector: Object,
	},
	methods: {
		nodes() {
			const nodes = []
			if (this.scene.tree.children) {
				for (const scene of this.scene.tree.children) {
					this.flattenNode(scene, nodes, 0)
				}
			}
			return nodes
		},
		flattenNode(node, nodes, indent) {
			let title = node.type;
			if (typeof node.name !== 'undefined' && node.name !== null && node.name != '') {
				if (node.type === 'Unknown') {
					title = node.name;
				} else {
					title = node.type + ' (' + node.name + ')';
				}
			}
			let selected  = false
			if (this.scene.selected && this.scene.selected._inspector) {
				selected = node.id === this.scene.selected._inspector.id
			}
			nodes.push({
				id: node.id,
				leaf: node.leaf,
				collapsed: node.collapsed,
				title: title,
				selected: selected,
				indent: indent
			})
			indent++
			if (!node.collapsed && !node.leaf) {
				for (const subnode of node.children) {
					this.flattenNode(subnode, nodes, indent)
				}
			}
		},
		select(id) {
			this.inspector.select(id)
		},
		navigateLeft() {
			const node = this.scene.selected._inspector
			if (!node.collapsed) {
				this.inspector.collapse(node.id)
			} else if (this.scene.context.parent) {
				this.inspector.select(this.scene.context.parent)
				this.inspector.highlight(this.scene.context.parent)
			}
		},
		navigateRight() {
			const node = this.scene.selected._inspector
			if (node.collapsed) {
				this.inspector.expand(node.id)
			} else if (this.scene.context.next) {
				this.inspector.select(this.scene.context.next)
				this.inspector.highlight(this.scene.context.next)
			}
		},
		navigateUp() {
			if (this.scene.context.prev) {
				this.inspector.select(this.scene.context.prev)
				this.inspector.highlight(this.scene.context.prev)
			}
		},
		navigateDown() {
			if (this.scene.context.next) {
				this.inspector.select(this.scene.context.next)
				this.inspector.highlight(this.scene.context.next)
			}
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
.treeview__indent {
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