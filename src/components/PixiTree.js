var React = require("react");
var agent = require("../agentProxy");
var TreeView = require("./TreeView");

var PixiTree = React.createClass({

	render: function () {
		return <span>
			{this.subtree(this.props.tree)}
		</span>
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
	}
});
module.exports = PixiTree;