var proxy = require('./proxy');

/**
 * Async access to the PIXI.inspector which works in both browser and devtool panel environments.
 */
var inspectorProxy = {
	refresh: function () {
		return proxy.apply('PIXI.inspector', 'refresh');
	},
	tree: function () {
		return proxy.apply('PIXI.inspector', 'tree');
	},
	expand: function (id) {
		return proxy.apply('PIXI.inspector', 'expand', [id]);
	},
	collapse: function (id) {
		return proxy.apply('PIXI.inspector', 'collapse', [id]);
	},
	select: function (id) {
		return proxy.apply('PIXI.inspector', 'select', [id]);
	},
	selection: function () {
		return proxy.apply('PIXI.inspector', 'selection');
	},
	context: function (id) {
		return proxy.apply('PIXI.inspector', 'context', [id]);
	}
};
module.exports = inspectorProxy;