import {Component} from "react";
import {Observable} from "rx";
import PixiTree from "./PixiTree";
import DetailView from "./DetailView";
import SplitView from "./SplitView";
import Toggle from "./Toggle";
import Toolbar from "./Toolbar";
import scene from "../services/scene";
import refresh from "../services/refresh";
import detectPixi from "../services/detectPixi";
import proxy from "../services/proxy";
import inspectorProxy from "../services/inspectorProxy";

require("./PixiPanel.scss");

// require('../pixi.inspector'); // Enable for live reload
var DEBUG = false;

export default class PixiPanel extends Component {
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
		var hoverId = this.state.hover;
		var context = this.state.context || {};
		return <span className="pixi-panel">{reboot}
			<Toolbar><Toggle icon="node-search" value={this.state.selectMode} onChange={this.toggleSelectMode.bind(this)} title="Select a node in the scene to inspect it"/></Toolbar>
			<SplitView>
				<PixiTree tree={tree} selectedId={selectedId} hoverId={hoverId} context={context} />
				{selected ? <DetailView data={selected} />: ''}
			</SplitView>
		</span>
	}
	componentDidMount() {
		this.subscriptions = [
			scene.subscribe( (_scene) => {
				this.setState(_scene);
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
