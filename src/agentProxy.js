/**
 * Async access to the PixiAgent
 */
var agentProxy = {
	tree: function () {
		return this._apply('tree');
	},
	expand: function (id) {
		return this._apply('expand', [id]);
	},
	collapse: function (id) {
		return this._apply('collapse', [id]);
	},
	select: function (id) {
		return this._apply('select', [id]);
	},
	selection: function () {
		return this._apply('selection');
	},
	context: function (id) {
		return this._apply('context', [id]);
	},
	_apply: function(method, args) {
		args = args || [];
		if (window.pixiAgent) {
			return new Promise(function (resolve) {
				resolve(window.pixiAgent[method].apply(window.pixiAgent, args));
			});
		} else {
			var code = 'window.pixiAgent.' + method + '(';
			for (var i in args) {
				if (i !== 0) {
					code += ', ';
				}
				code += JSON.stringify(args[i]);
			}
			code += ');';
			return this._eval(code);
		}
	},
	_log: function (message) {
		if (chrome.devtools) {
			chrome.devtools.inspectedWindow.eval('console.log(' + JSON.stringify(message) + ');');
		} else {
			console.log(message);
		}
	},
	_eval: function (code, tplvars) {
		if (typeof code === 'function') {
			code = '(' + code.toString() + '());';
		}
		if (tplvars) {
			for (var key in tplvars) {
				code = code.replace(key, tplvars[key])
			}
		}
		return new Promise(function (resolve, reject) {
			if (chrome.devtools) {
				chrome.devtools.inspectedWindow.eval(code, function (result, exceptionInfo) {
					if (exceptionInfo) {
						reject(exceptionInfo.value);
					} else {
						resolve(result);
					}
				});
			} else {
				resolve(eval(code));
			}
		});
		
	},
	_inject: function (script) {
		return this._eval(function () {
			var script = window.document.createElement('script');
			script.src = SCRIPT_URL;
			var html = document.getElementsByTagName('html')[0];
			html.appendChild(script);
		}, {
			SCRIPT_URL: JSON.stringify(chrome.extension.getURL(script))
		});
	}
};
module.exports = agentProxy;