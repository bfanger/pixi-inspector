require("./PixiInspector.scss");
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
		var tree = this.state.tree;
		if (!tree) {
			return <div className="pixi-inspector__error"><span onClick={this.reboot}>[reboot]</span> Pixi.js not detected.</div>
		}
		var selected = this.state.selected;
		var selectedId = selected ? selected._inspector.id : false;
		return <span className="pixi-inspector"><span onClick={this.reboot}>[reboot]</span><SplitView>
			<PixiTree tree={tree} selectedId={selectedId} onRefresh={this.refresh} />
			{selected ? <DetailView data={selected} />: ''}
		</SplitView></span>
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
	},
	reboot: function () {
		location.reload();
	}
});
module.exports = PixiInspector;