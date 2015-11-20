var proxy = require('./proxy');
var refresh = require('./refresh');

/**
 * Async access to the __PIXI_INSPECTOR_GLOBAL_HOOK__ which works in both browser and devtool panel environments.
 */
class InspectorProxy {

	scene() {
		return proxy.apply('__PIXI_INSPECTOR_GLOBAL_HOOK__', 'scene');
	}
	tree() {
		return proxy.apply('__PIXI_INSPECTOR_GLOBAL_HOOK__', 'tree');
	}
	selection() {
		return proxy.apply('__PIXI_INSPECTOR_GLOBAL_HOOK__', 'selection');
	}
	context(id) {
		return proxy.apply('__PIXI_INSPECTOR_GLOBAL_HOOK__', 'context', [id]);
	}
	expand(id) {
		return proxy.apply('__PIXI_INSPECTOR_GLOBAL_HOOK__', 'expand', [id]).then(function (value) {
			refresh.onNext('expand');
			return value;
		});
	}
	collapse(id) {
		return proxy.apply('__PIXI_INSPECTOR_GLOBAL_HOOK__', 'collapse', [id]).then(function (value) {
			refresh.onNext('collapse');
			return value;
		});
	}
	select(id) {
		return proxy.apply('__PIXI_INSPECTOR_GLOBAL_HOOK__', 'select', [id]).then(function (value) {
			refresh.onNext('select');
			return value;
		});
	}
	hover(id) {
		return proxy.apply('__PIXI_INSPECTOR_GLOBAL_HOOK__', 'hover', [id]).then(function (value) {
			refresh.onNext('hover');
			return value;
		});
	}
	selectMode(value) {
		return proxy.eval('__PIXI_INSPECTOR_GLOBAL_HOOK__.selectMode = ' + JSON.stringify(value)).then(function (value) {
			refresh.onNext('selectMode');
			return value;
		});
	}

};
module.exports = new InspectorProxy();