import { Observable } from 'rxjs/Observable'
import detectPixi from './detectPixi'
import proxy from './proxy'

/**
 * @var {Observable}
 * - Wait for detected PIXI
 * - Inject inpector for the detected path
 * - Wait until injected script is executed
 */
export default detectPixi.switchMap(function (path) {
	return proxy.eval('typeof window.__PIXI_INSPECTOR_GLOBAL_HOOK__').then(function (type) {
		if (type !== 'object') {
			return proxy.eval('window.__PIXI_INSPECTOR_GLOBAL_HOOK__ = "' + path + '"').then(function () {
				return proxy.injectScript('pixi.inspector.js')
			})
		}
	}).then(function () {
		return path
	})
}).delay(1).switchMap(function (path) {
	return Observable.create(observer => {
		proxy.eval('typeof window.__PIXI_INSPECTOR_GLOBAL_HOOK__').then(type => {
			if (type === 'object') {
				observer.next(path)
				observer.complete()
			} else {
				observer.error(new Error('pixi.inspector.js not yet executed'))
			}
		})
	}).retryWhen(errors => {
		return errors.delay(1000)
	})
}).publishReplay(1).refCount()
