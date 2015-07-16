var agentProxy = {
	tree: function () {
		return this._exec('tree');
	},
	expand: function (id) {
		return this._exec('expand', [id]);
	},
	collapse: function (id) {
		return this._exec('collapse', [id]);
	},
	select: function (id) {
		return this._exec('select', [id]);
	},
	selection: function () {
		return this._exec('selection');
	},
	context: function (id) {
		return this._exec('context', [id]);
	},
	_exec: function(method, args) {
		args = args || [];
		if (window.pixiAgent) {
			return window.pixiAgent[method].apply(window.pixiAgent, args);
		}
	}
};
module.exports = agentProxy