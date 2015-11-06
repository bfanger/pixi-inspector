var {Observable} = require('rx');
var detectPixi = require('./detectPixi')
var proxy = require('./proxy')
/**
 * @var {Observable}
 * - Wait for detected PIXI
 * - Inject inpector for the detected path
 * - Wait until injected script is executed
 */
var injectInspector = detectPixi.flatMap(function (path) {
	return proxy.eval('typeof window.__PIXI_INSPECTOR_GLOBAL_HOOK__').then(function (type) {
		if (type !== 'object') {
			return proxy.eval('window.__PIXI_INSPECTOR_GLOBAL_HOOK__ = "' + path + '"').then(function () {
				return proxy.injectScript('pixi.inspector.js');
			});
		}
	}).then (function () {
		return path;
	});
}).delay(1).flatMap(function (path) {
	return Observable.defer(function () {
		return proxy.eval('typeof window.__PIXI_INSPECTOR_GLOBAL_HOOK__').then(function (type) {
			if (type !== 'object') {
				throw new Error('pixi.inspector.js not yet executed');
			}
		})
	}).retryWhen(function (errors) {
		return errors.delay(25)
	}).map(path);
}).share()

module.exports = injectInspector;