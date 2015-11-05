var React = require("react");
var inspector = require("../inspectorProxy");
var TreeView = require("./TreeView");

var PixiTree = React.createClass({
	propTypes: {
		tree: React.PropTypes.object,
		// onRefresh: React.PropTypes.function
	},

	render: function () {
		var nodes = this.subtree(this.props.tree);
		if (nodes.length === 1) {
			return nodes[0]
		} else {
			return <span>{nodes}</span>
		}
	},
	subtree: function (node) {
		if (!node.children) {
			return [];
		}

		return node.children.map(node => {
            var title = node.name;
            if (title == undefined) {
                title = node.type
            }
			return <TreeView 
				key={node.id} 
				title={title}
				leaf={node.leaf}
				collapsed={node.collapsed} 
				selected={node.id === this.props.selectedId} 
				renderChildren={this.subtree.bind(this, node)}
				onExpand={this.expand.bind(this, node)} 
				onCollapse={this.collapse.bind(this, node)} 
				onSelect={this.select.bind(this, node)} 
				onSelectParent={this.selectParent.bind(this, node)}
				onSelectPrevious={this.selectPrevious.bind(this, node)}
				onSelectNext={this.selectNext.bind(this, node)}
			/>
		})
	},
	expand: function (node) {
		inspector.expand(node.id);
		this.props.onRefresh();
	},
	collapse: function (node) {
		inspector.collapse(node.id);
		this.props.onRefresh();
	},
	select: function (node) {
		inspector.select(node.id);
		this.props.onRefresh();
	},
	selectParent: function (node, e) {
		var context = this.props.context;
		if (context.parent) {
			inspector.select(context.parent);
			e.preventDefault()
			this.props.onRefresh();
		}
	},
	selectPrevious: function (node, e) {
		var context = this.props.context;
		if (context.prev) {
			inspector.select(context.prev);
			e.preventDefault()
			this.props.onRefresh();
		}
	},
	selectNext: function (node, e) {
		var context = this.props.context;
		if (context.next) {
			inspector.select(context.next);
			e.preventDefault()
			this.props.onRefresh();
		}
	},
});
module.exports = PixiTree;