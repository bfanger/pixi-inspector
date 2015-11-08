var proxy = require('./proxy');
var refresh = require('./refresh');

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
	selection: function () {
		return proxy.apply('__PIXI_INSPECTOR_GLOBAL_HOOK__', 'selection');
	},
	context: function (id) {
		return proxy.apply('__PIXI_INSPECTOR_GLOBAL_HOOK__', 'context', [id]);
	},
	expand: function (id) {
		return proxy.apply('__PIXI_INSPECTOR_GLOBAL_HOOK__', 'expand', [id]).then(function (value) {
			refresh.onNext('expand');
			return value;
		});
	},
	collapse: function (id) {
		return proxy.apply('__PIXI_INSPECTOR_GLOBAL_HOOK__', 'collapse', [id]).then(function (value) {
			refresh.onNext('collapse');
			return value;
		});
	},
	select: function (id) {
		return proxy.apply('__PIXI_INSPECTOR_GLOBAL_HOOK__', 'select', [id]).then(function (value) {
			refresh.onNext('select');
			return value;
		});
	}
};
module.exports = inspectorProxy;