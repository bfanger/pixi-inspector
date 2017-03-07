import { Observable } from 'rxjs/Observable';
import refresh from './refresh';
import injectInspector from './injectInspector';
import inspectorProxy from './inspectorProxy';

export default Observable
	.combineLatest(injectInspector, refresh.startWith('inital'))
	.switchMap(function (thing) {
		return inspectorProxy.scene();
	});
