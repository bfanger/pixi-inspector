import { Observable } from 'rxjs/Observable'
import proxy from './proxy'
import InspectorProxy from './InspectorProxy'
const debug = false
/**
 * Inject inpector for the detected path
 * - wait
 */
export default function injectInspector(path) {
	return Observable.fromPromise(proxy.eval('window.__PIXI_INSPECTOR_GLOBAL_HOOK__ = "' + path + '"').then(() => {
		debug && console.log('injectInspector() inject script')
		return proxy.injectScript('pixi.inspector.js')
	})).delay(50).switchMap(() => {
		return Observable.create(observer => {
			debug && console.log('injectInspector() detect inspector')
			proxy.eval('typeof window.__PIXI_INSPECTOR_GLOBAL_HOOK__').then(type => {
				if (type === 'object') {
					debug && console.log('injectInspector() inspector detected')
					observer.next(new InspectorProxy())
					observer.complete()
				} else {
					debug && console.log('injectInspector() not yet detected')
					observer.error(new Error('pixi.inspector.js not yet executed'))
				}
			})
		}).retryWhen(errors => {
			return errors.delay(250)
		})
	}).timeout(2000)
}
