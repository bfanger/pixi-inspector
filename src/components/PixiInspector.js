var React = require("react");
var agent = require("../agentProxy");
var PixiTree = require("./PixiTree");
var DetailView = require("./DetailView");
var SplitView = require("./SplitView");

// require('../pixiAgent'); // Enable for livereload

var PixiInspector = React.createClass({

	getInitialState: function () {
		var state = {
			tree: agent.tree(),
			selected: agent.selection()
		}
		return state;
	},
	render: function () {
		var selectedId = this.state.selected ? this.state.selected._inspector.id : false;
		return <SplitView>
			<PixiTree tree={this.state.tree} selectedId={selectedId} onRefresh={this.refresh} />
			{this.state.selected ? <DetailView data={this.state.selected} />: ''}
		</SplitView>
	},
	componentDidMount: function () {
		window.addEventListener('PIXI.refresh', this.refresh)
	},
	componentWillUnmount: function () {
		window.removeEventListener('PIXI.refresh', this.refresh)	
	},
	refresh: function (e) {
		var state = {
			tree: agent.tree(),
			selected: agent.selection()
		}
		if (!state.selected && state.tree.children && state.tree.children.length > 0) {
			agent.select(state.tree.children[0].id);
			state.selected = agent.selection();
		}
		this.setState(state);
	}
});
module.exports = PixiInspector;