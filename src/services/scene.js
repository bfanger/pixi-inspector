var {Observable} = require('rx');
var refresh  = require('./refresh');
var injectInspector = require('./injectInspector');
var inspectorProxy = require('./inspectorProxy');

var scene = Observable
	.combineLatest(injectInspector, refresh.startWith('inital'))
	.flatMap(function (thing) {
		return inspectorProxy.scene();
	});

module.exports = scene;