require("./PixiPanel.scss");
var React = require("react");
var inspector = require("../inspectorProxy");
var PixiTree = require("./PixiTree");
var DetailView = require("./DetailView");
var SplitView = require("./SplitView");
var proxy = require("../proxy");

proxy.BASE = 'http://localhost/pixi-inspector/build/';
// require('../pixi.inspector'); // Enable for livereload
var DEBUG = false;

var PixiPanel = React.createClass({

	getInitialState: function () {
		var state = {
			tree: false,
			selected: false,
			pixiDetected: false
		}
		return state;
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
			<PixiTree tree={tree} selectedId={selectedId} context={context} onRefresh={this.refresh} />
			{selected ? <DetailView data={selected} />: ''}
		</SplitView></span>
	},
	componentDidMount: function () {
		this.timeout = this.detectPixi();
	},
	componentWillUnmount: function () {
		clearTimeout(this.timeout);
	},
	detectPixi: function () {
		proxy.eval('window.PIXI ? (PIXI.inspector ? "INSPECTOR": "PIXI") : false').then( (detected) => {
			if (this.isMounted()) {
				if (detected === 'PIXI') {
					this.setState({pixiDetected: true});
					proxy.injectScript('pixi.inspector.js').then( () => {
						this.detectInspector();
					});
				} else if (detected === 'INSPECTOR') {
					this.setState({pixiDetected: true});
					this.poll(); 
				} else {
					this.timeout = setTimeout(this.detectPixi, 3000); // Check for PIXI every x miliseconds
				}
			}
		});
	},
	/**
	 * Check if the injected script is loaded.
	 */
	detectInspector: function () {
		proxy.eval('!!window.PIXI.inspector').then( (injected) => {
			if (this.isMounted()) {
				if (injected) {
					this.poll();
				} else {
					this.timeout = setTimeout(this.detectInspector, 25);
				}
			}
		});
	},
	poll: function () {
		this.refresh();
		this.timeout = setTimeout(this.poll, 500);
	},
	refresh: function (e) {
		inspector.refresh().then( (state) => {
			this.setState(state);
		}, (error) => {
			// Probably a page-refresh
			this.setState({
				pixiDetected: false,
				tree: false,
				selected: false
			});
			clearTimeout(this.timeout);
			proxy.eval('window.PIXI ? (PIXI.inspector ? "INSPECTOR": "PIXI") : false').then( (detected) => {
				if (detected === 'INSPECTOR')  {
					this.setState({error: error});
				} else {
					this.detectPixi();
				}
			});
		})
	},
	reboot: function () {
		location.reload();
	}
});
module.exports = PixiPanel;