var React = require("react");
var agent = require("../agentProxy");
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
			return <TreeView 
				key={node.id} 
				title={node.type} 
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
		agent.expand(node.id);
		this.props.onRefresh();
	},
	collapse: function (node) {
		agent.collapse(node.id);
		this.props.onRefresh();
	},
	select: function (node) {
		agent.select(node.id);
		this.props.onRefresh();
	},
	selectParent: function (node, e) {
		var context = this.props.context;
		if (context.parent) {
			agent.select(context.parent);
			e.preventDefault()
			this.props.onRefresh();
		}
	},
	selectPrevious: function (node, e) {
		var context = this.props.context;
		if (context.prev) {
			agent.select(context.prev);
			e.preventDefault()
			this.props.onRefresh();
		}
	},
	selectNext: function (node, e) {
		var context = this.props.context;
		if (context.next) {
			agent.select(context.next);
			e.preventDefault()
			this.props.onRefresh();
		}
	},
});
module.exports = PixiTree;