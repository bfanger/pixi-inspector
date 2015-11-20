require("./PixiPanel.scss");
var {Component} = require("react");
var {Observable} = require("rx");
var PixiTree = require("./PixiTree");
var DetailView = require("./DetailView");
var SplitView = require("./SplitView");
var Toggle = require("./Toggle");
var Toolbar = require("./Toolbar");
var scene = require("../services/scene");
var refresh = require("../services/refresh");
var detectPixi = require("../services/detectPixi");
var proxy = require("../services/proxy");
var inspectorProxy = require("../services/inspectorProxy");

// require('../pixi.inspector'); // Enable for live reload
var DEBUG = false;

class PixiPanel extends Component {
	constructor(props) {
		super(props)
		this.state = {
			tree: false,
			mode: 'NORMAL',
			selected: false,
			pixiDetected: false
		};
	}
	render() {
		var tree = this.state.tree;
		var reboot = DEBUG ? <span onClick={this.reboot}>[ reboot {this.state.error} ]</span> : <span>{this.state.error}</span>;
		if (!tree) {
			return <div className="pixi-panel__message">{reboot} {this.state.pixiDetected ? 'Connecting to Pixi...' : 'Looking for Pixi...'}</div>
		}
		var selected = this.state.selected;
		var selectedId = selected ? selected._inspector.id : false;
		var context = this.state.context || {};
		return <span className="pixi-panel">{reboot}
			<Toolbar><Toggle icon="node-search" value={this.state.selectMode} onChange={this.toggleSelectMode.bind(this)} /></Toolbar>
			<SplitView>
				<PixiTree tree={tree} selectedId={selectedId} context={context} />
				{selected ? <DetailView data={selected} />: ''}
			</SplitView>
		</span>
	}
	componentDidMount() {
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
	}
	componentWillUnmount() {
		this.subscriptions.forEach( (subscription) => {
			subscription.dispose();
		});
	}
	toggleSelectMode(value) {
		inspectorProxy.selectMode(value);
	}
	reboot() {
		location.reload();
	}
};
module.exports = PixiPanel;