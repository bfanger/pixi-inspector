var React = require("react");
var agent = require("../agentProxy");
var PixiTree = require("./PixiTree");
var DetailView = require("./DetailView");

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
		return <span>
			<div style={{float:'left', padding: 10}}>
				<PixiTree tree={this.state.tree} selectedId={selectedId} onRefresh={this.refresh} />
			</div>
			<div style={{float:'left', border:'1px solid black', padding: 10}}>
			{this.state.selected ? <DetailView data={this.state.selected} />: ''}
			</div>
		</span>
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