import proxy from './proxy';
import { Subject } from 'rxjs/Subject';

/**
 * Async access to the __PIXI_INSPECTOR_GLOBAL_HOOK__ which works in both browser and devtool panel environments.
 */
export default class InspectorProxy {

	constructor() {
		this.refresh$ = new Subject()
		this.scene$ = this.refresh$.startWith('initial').concatMap(signal => {
			return this.scene()
		}).publishReplay(1).refCount()
	}

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
		return proxy.apply('__PIXI_INSPECTOR_GLOBAL_HOOK__', 'expand', [id]).then(value => {
			this.refresh$.next('expand');
			return value;
		});
	}
	collapse(id) {
		return proxy.apply('__PIXI_INSPECTOR_GLOBAL_HOOK__', 'collapse', [id]).then(value => {
			this.refresh$.next('collapse');
			return value;
		});
	}
	select(id) {
		return proxy.apply('__PIXI_INSPECTOR_GLOBAL_HOOK__', 'select', [id]).then(value => {
			this.refresh$.next('select');
			return value;
		});
	}
	highlight(id) {
		return proxy.apply('__PIXI_INSPECTOR_GLOBAL_HOOK__', 'highlight', [id]).then(value => {
			// this.refresh$.next('highlight');
			return value;
		});
	}
	selectMode(value) {
		return proxy.eval('__PIXI_INSPECTOR_GLOBAL_HOOK__.selectMode = ' + JSON.stringify(value)).then(value => {
			this.refresh$.next('selectMode');
			return value;
		});
	}

};