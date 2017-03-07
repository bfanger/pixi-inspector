import proxy from './proxy';
import refresh from './refresh';

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
			refresh.next('expand');
			return value;
		});
	}
	collapse(id) {
		return proxy.apply('__PIXI_INSPECTOR_GLOBAL_HOOK__', 'collapse', [id]).then(function (value) {
			refresh.next('collapse');
			return value;
		});
	}
	select(id) {
		return proxy.apply('__PIXI_INSPECTOR_GLOBAL_HOOK__', 'select', [id]).then(function (value) {
			refresh.next('select');
			return value;
		});
	}
	highlight(id) {
		return proxy.apply('__PIXI_INSPECTOR_GLOBAL_HOOK__', 'highlight', [id]).then(function (value) {
			refresh.next('highlight');
			return value;
		});
	}
	selectMode(value) {
		return proxy.eval('__PIXI_INSPECTOR_GLOBAL_HOOK__.selectMode = ' + JSON.stringify(value)).then(function (value) {
			refresh.next('selectMode');
			return value;
		});
	}

};
export default new InspectorProxy();