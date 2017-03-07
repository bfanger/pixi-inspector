import React, { Component, PropTypes } from "react";
import inspector from "../services/inspectorProxy";
import TreeView from "./TreeView";

export default class PixiTree extends Component {

	render() {
		var nodes = this.subtree(this.props.tree);
		if (nodes.length === 1) {
			return nodes[0]
		} else {
			return <span>{nodes}</span>
		}
	}
	subtree(node) {
		if (!node.children) {
			return [];
		}

		return node.children.map(node => {
			var title = node.type;
			if (typeof node.name !== 'undefined' && node.name !== null && node.name != '') {
				if (node.type === 'Unknown') {
					title = node.name;
				} else {
					title = node.type + ' (' + node.name + ')';
				}
			}
			return <TreeView
				key={node.id}
				title={title}
				leaf={node.leaf}
				collapsed={node.collapsed}
				selected={node.id === this.props.selectedId}
				hovered={node.id === this.props.hoverId}
				renderChildren={this.subtree.bind(this, node)}
				onExpand={this.expand.bind(this, node)}
				onCollapse={this.collapse.bind(this, node)}
				onSelect={this.select.bind(this, node)}
				onSelectParent={this.selectParent.bind(this, node)}
				onSelectPrevious={this.selectPrevious.bind(this, node)}
				onSelectNext={this.selectNext.bind(this, node)}
				onMouseEnter={this.mouseEnter.bind(this, node)}
				onMouseLeave={this.mouseLeave.bind(this)}
				onFocus={this.focus.bind(this, node)}
				onBlur={this.blur.bind(this)}
			/>
		})
	}
	expand(node) {
		inspector.expand(node.id);
	}
	collapse(node) {
		inspector.collapse(node.id);
	}
	select(node) {
		inspector.select(node.id);
	}
	selectParent(node, e) {
		var context = this.props.context;
		if (context.parent) {
			inspector.select(context.parent);
			e.preventDefault()
		}
	}
	selectPrevious(node, e) {
		var context = this.props.context;
		if (context.prev) {
			inspector.select(context.prev);
			e.preventDefault()
		}
	}
	selectNext(node, e) {
		var context = this.props.context;
		if (context.next) {
			inspector.select(context.next);
			e.preventDefault()
		}
	}
	mouseEnter(node) {
		inspector.highlight(node.id);
	}
	mouseLeave() {
		inspector.highlight(false);
	}
	focus(node) {
		inspector.highlight(node.id);
		if (node.id !== this.props.selectedId) {
			inspector.select(node.id);
		}
	}
	blur() {
		inspector.highlight(false);
	}
};
PixiTree.propTypes = {
	tree: PropTypes.object
};