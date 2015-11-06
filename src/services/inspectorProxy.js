var proxy = require('./proxy');

/**
 * Async access to the __PIXI_INSPECTOR_GLOBAL_HOOK__ which works in both browser and devtool panel environments.
 */
var inspectorProxy = {
	scene: function () {
		return proxy.apply('__PIXI_INSPECTOR_GLOBAL_HOOK__', 'scene');
	},
	tree: function () {
		return proxy.apply('__PIXI_INSPECTOR_GLOBAL_HOOK__', 'tree');
	},
	expand: function (id) {
		return proxy.apply('__PIXI_INSPECTOR_GLOBAL_HOOK__', 'expand', [id]);
	},
	collapse: function (id) {
		return proxy.apply('__PIXI_INSPECTOR_GLOBAL_HOOK__', 'collapse', [id]);
	},
	select: function (id) {
		return proxy.apply('__PIXI_INSPECTOR_GLOBAL_HOOK__', 'select', [id]);
	},
	selection: function () {
		return proxy.apply('__PIXI_INSPECTOR_GLOBAL_HOOK__', 'selection');
	},
	context: function (id) {
		return proxy.apply('__PIXI_INSPECTOR_GLOBAL_HOOK__', 'context', [id]);
	}
};
module.exports = inspectorProxy;