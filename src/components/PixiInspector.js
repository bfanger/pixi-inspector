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
			tree: false,
			selected: false
		}
		return state;
	},
	render: function () {
		var tree = this.state.tree;
		if (!tree) {
			return <div className="pixi-inspector__error"><span onClick={this.reboot}>[reboot]</span> Pixi.js not detected.<span onClick={this.refresh}>refresh</span></div>
		}
		var selected = this.state.selected;
		var selectedId = selected ? selected._inspector.id : false;
		var context = this.state.context || {};
		return <span className="pixi-inspector"><span onClick={this.reboot}>[reboot]</span><SplitView>
			<PixiTree tree={tree} selectedId={selectedId} context={context} onRefresh={this.refresh} />
			{selected ? <DetailView data={selected} />: ''}
			<span onClick={this.refresh}>refresh</span>
		</SplitView></span>
	},
	componentDidMount: function () {
		window.addEventListener('PIXI.refresh', this.refresh)
		if (chrome.devtools) {
			agent._eval(function () {
				return (typeof window.pixiAgent !== 'undefined');
			}).then(function (loaded) {
				if (!loaded) {
					agent._inject('pixiAgent.js');
				}
			});
		}
		this.refresh();
	},
	componentWillUnmount: function () {
		window.removeEventListener('PIXI.refresh', this.refresh)	
	},
	refresh: function (e) {
		Promise.all([agent.tree(), agent.selection()]).then(function (results) {
			var state = {
				tree: results[0],
				selected: results[1] 
			}
			return new Promise(function (resolve) {
				if (!state.selected && state.tree.children && state.tree.children.length > 0) {
					agent.select(state.tree.children[0].id).then(function () {
						agent.selection().then(function (selection) {
							state.selected = selection;
							agent.context(state.selected._inspector.id).then(function (context) {
								state.context = context;
								resolve(state);
							});
						});
					});
				} else if (state.selected){
					 agent.context(state.selected._inspector.id).then(function (context) {
						state.context = context;
						resolve(state);
					});
				} else {
					resolve(state);
				}
			});
		}).then( state => {
			this.setState(state);
		}) ;
		
	},
	reboot: function () {
		location.reload();
	}
});
module.exports = PixiInspector;