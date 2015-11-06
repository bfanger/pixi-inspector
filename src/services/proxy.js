/**
 * A proxy for executing code in the inspectedWindow environment.
 *
 * Has convenience wrappers for console methods. `proxy.log('a example message')`   
 */
var proxy = {
	
	BASE: 'http://localhost:8090/src/',

	/**
	 * Proxy to console.log() 
	 * @param {String} message 
	 */
	log: function (message) {
		return this.apply('console', 'log', arguments);
	},

	/**
	 * Proxy to console.warn() 
	 * @param {String} message 
	 */
	warn: function (message) {
		return this.apply('console', 'warn', arguments);
	},

	/**
	 * Proxy to console.error() 
	 * @param {String} message 
	 */
	error: function (message) {
		return this.apply('console', 'error', arguments);
	},
	
	/**
	 * @param {String} object
	 * @param {method} method
	 * @param {Array} [args]
	 * @returns Promise  
	 */
	apply: function(object, method, args) {
		args = args || [];
		var code = object + '.' + method + '(';
		for (var i in args) {
			if (i !== "0") {
				code += ', ';
			}
			code += JSON.stringify(args[i]);
		}
		code += ')';
		return this.eval(code);
	},
	/**
	 * @param {Function} fn
	 * @param {Object} tplvars
	 * @returns Promise
	 */
	evalFn: function (fn, constants) {
		var code = fn;
		if (typeof code === 'function') {
			code = '(' + fn.toString() + '());';
		}
		if (constants) {
			for (var key in constants) {
				code = code.replace(key, constants[key])
			}
		}
		return this.eval(code);
	},

	/**
	 * @param {String} code
	 * @returns Promise
	 */
	eval: function (code) {
		return new Promise(function (resolve, reject) {
			if (chrome.devtools) {
				chrome.devtools.inspectedWindow.eval(code, function (result, exceptionInfo) {
					if (exceptionInfo) {
						// proxy.log('code', code);
						// proxy.warn(exceptionInfo);
						if (exceptionInfo.isException) {
							reject(exceptionInfo.value);
						} else if (exceptionInfo.isError) {
							if (exceptionInfo.description.match(/%s/) && exceptionInfo.details.length === 1) {
								proxy.warn(exceptionInfo.description.replace(/%s/, exceptionInfo.details[0]));
								reject(exceptionInfo.description);
							}
						}	
						reject(exceptionInfo);
					} else {
						resolve(result);
					}
				});
			} else {
				resolve(eval(code));
			}
		});
	},

	/**
	 * @param {String} url 
	 */
	injectScript: function (url) {
		var SCRIPT_URL = url;/* make linters happy */
		if (chrome.extension) {
			url = chrome.extension.getURL(url);	
		} else {
			url = this.BASE + url;
		}
		return this.evalFn(function () {
			var script = window.document.createElement('script');
			script.src = SCRIPT_URL;
			var html = document.getElementsByTagName('html')[0];
			html.appendChild(script);
		}, {
			SCRIPT_URL: JSON.stringify(url)
		});
	}
};

if (typeof module !== 'undefined') {
	module.exports = proxy;
}