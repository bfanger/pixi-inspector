require("./PixiPanel.scss");
var React = require("react");
var {Observable} = require("rx");
var PixiTree = require("./PixiTree");
var DetailView = require("./DetailView");
var SplitView = require("./SplitView");
var scene = require("../services/scene");
var refresh = require("../services/refresh");
var detectPixi = require("../services/detectPixi");
var proxy = require("../services/proxy");

// require('../pixi.inspector'); // Enable for live reload
var DEBUG = false;

var PixiPanel = React.createClass({

	getInitialState: function () {
		return {
			tree: false,
			selected: false,
			pixiDetected: false
		};
	},
	render: function () {
		var tree = this.state.tree;
		var reboot = DEBUG ? <span onClick={this.reboot}>[ reboot {this.state.error} ]</span> : <span>{this.state.error}</span>;
		if (!tree) {
			return <div className="pixi-panel__error">{reboot} {this.state.pixiDetected ? 'No stages rendered.' : 'Pixi.js not detected.'}</div>
		}
		var selected = this.state.selected;
		var selectedId = selected ? selected._inspector.id : false;
		var context = this.state.context || {};
		return <span className="pixi-panel">{reboot}<SplitView>
			<PixiTree tree={tree} selectedId={selectedId} context={context} />
			{selected ? <DetailView data={selected} />: ''}
		</SplitView></span>
	},
	componentDidMount: function () {
		this.subscriptions = [
			scene.subscribe( (scene) => {
				this.setState(scene);
			}, error => {
				proxy.eval('typeof window.__PIXI_INSPECTOR_GLOBAL_HOOK__').then(function (type) {
					if (type === 'object') {
						console.error(error);
				 	} else { // page refresh?
					 	location.reload();
					}
				})
				
			}),
			detectPixi.subscribe( (path) => {
				this.setState({pixiDetected: path });
			}),
			Observable.interval(500).subscribe(refresh)
		];
	},
	componentWillUnmount: function () {
		this.subscriptions.forEach( (subscription) => {
			subscription.dispose();
		});
	},
	reboot: function () {
		location.reload();
	}
});
module.exports = PixiPanel;