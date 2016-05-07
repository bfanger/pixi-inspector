import {Observable} from 'rx';
import refresh  from './refresh';
import injectInspector from './injectInspector';
import inspectorProxy from './inspectorProxy';

export default Observable
	.combineLatest(injectInspector, refresh.startWith('inital'))
	.flatMap(function (thing) {
		return inspectorProxy.scene();
	});
