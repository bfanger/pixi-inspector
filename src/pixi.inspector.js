(function () {
	if (typeof window.__PIXI_INSPECTOR_GLOBAL_HOOK__ === 'undefined') {
		throw new Error('PIXI must be detected before loading pixi.inspector.js')
	}
	if (typeof window.__PIXI_INSPECTOR_GLOBAL_HOOK__ === 'object') {
		console.log('Injected twice');
		return;
	}
	var path = window.__PIXI_INSPECTOR_GLOBAL_HOOK__;
	var PIXI = eval(path);
	function noop() { }
	function MismatchConstructor() { };
	var TransformBaseRef = MismatchConstructor;
	var ObservablePointRef = MismatchConstructor;

	var inspector = {

		selectMode: false,

		/**
		 * Root of the Pixi object tree.
		 */
		root: {
			children: [],
			_inspector: {
				id: 1,
				type: 'root',
				collapsed: false
			}
		},

		_highlight: {
			node: false,
			stage: false,
			point: false,
			graphics: PIXI.Graphics ? new PIXI.Graphics() : false, // Only supported in PIXI v3
		},
		_autoincrement: 1,
		_typeMap: {
			constructors: [],
			names: [],
		},

		/**
		 * Path the Renderer.render method to get a hold of the stage object(s)
		 */
		patch(Renderer) {
			var _render = Renderer.prototype.render;
			var self = this;
			Renderer.prototype.render = function (stage) {
				self.beforeRender(stage, this);
				var retval = _render.apply(this, arguments);
				return self.afterRender(stage, this, retval);
			}
		},

		/**
		 * An intercepted render call
		 */
		beforeRender(stage, renderer) {
			if (this.root.children.indexOf(stage) === -1) {
				this.root.children.push(stage);
				if (!window.$pixi) {
					window.$pixi = stage;
				}
			}
			var canvas = renderer.view;
			if (!canvas._inspector) {
				canvas._inspector = {
					id: this.generateId()
				};
				canvas.addEventListener('click', (e) => {
					if (!this.selectMode) {
						return;
					}
					e.preventDefault();
					e.stopPropagation();
					var rect = e.target.getBoundingClientRect();
					this.selectMode = false;
					this._highlight.point = false;
					this._highlight.node = false;
					this.selectAt(stage, new PIXI.Point(
						((e.clientX - rect.left) * (canvas.width / rect.width)) / renderer.resolution,
						((e.clientY - rect.top) * (canvas.height / rect.height)) / renderer.resolution
					));
				}, true);
				canvas.addEventListener('mousemove', (e) => {
					if (!this.selectMode) {
						return;
					}
					var rect = e.target.getBoundingClientRect();
					this._highlight.point = new PIXI.Point(
						((e.clientX - rect.left) * (canvas.width / rect.width)) / renderer.resolution,
						((e.clientY - rect.top) * (canvas.height / rect.height)) / renderer.resolution
					);
				}, false)
				canvas.addEventListener('mouseleave', (e) => {
					this._highlight.point = false;
					this._highlight.node = false;
				}, false);
			}
			// @todo remove stages after an idle period
			if (this._highlight.point) {
				this._highlight.node = this.highlightAt(stage, this._highlight.point);
			}
			var highlightNode = this._highlight.node;
			if (this._highlight.graphics && highlightNode && highlightNode.getBounds) {
				var box = this._highlight.graphics;
				box.clear();
				box.beginFill(0x007eff, 0.3);
				box.lineStyle(1, 0x007eff, 0.6);
				var bounds = highlightNode.getBounds();
				box.drawRect(bounds.x, bounds.y, bounds.width, bounds.height);
				box.endFill();
				stage.addChild(box);
				this._highlight.shouldRemove = true;
			}
		},
		afterRender(stage, renderer, retval) {
			if (this._highlight.shouldRemove) {
				stage.removeChild(this._highlight.graphics);
				this._highlight.shouldRemove = false;
			}
			return retval;
		},
		/**
		 * Aggregate results  for services/scene.js
		 */
		scene() {
			var scene = {
				tree: this.tree(),
				selectMode: this.selectMode,
				selected: false,
				hover: false,
				context: {}
			};
			if (this._highlight.node && this._highlight.node._inspector) {
				scene.hover = this._highlight.node._inspector.id;
			}
			if (window.$pixi) {
				scene.selected = this.selection();
				if (window.$pixi._inspector) {
					scene.context = this.context(window.$pixi._inspector.id);
				}
			}
			return scene;
		},
		tree() {
			return this.node(this.root);
		},
		expand(id) {
			var node = this.find(id);
			if (node) {
				node._inspector.collapsed = false;
			}
		},
		collapse(id) {
			var node = this.find(id);
			if (node) {
				node._inspector.collapsed = true;
			}
		},
		select(id) {
			window.$pixi = this.find(id);
			return this.selection();
		},
		selectAt(node, point) {
			if (node === this._highlight.graphics) {
				return false;
			}
			if (node.containsPoint) {
				if (node.containsPoint(point)) {
					this.node(node);
					window.$pixi = node;
					return node;
				}
			} else if (node.children && node.children.length) {
				for (var i = node.children.length - 1; i >= 0; i--) {
					var result = this.selectAt(node.children[i], point);
					if (result) {
						this.node(node);
						node._inspector.collapsed = false;
						return result;
					}
				}
			}
			if (node.getBounds && node.getBounds().contains(point.x, point.y)) {
				window.$pixi = node;
				return node;
			}
		},
		highlight(id) {
			if (id === false) {
				this._highlight.node = false;
				this._highlight.point = false;
			} else {
				this._highlight.node = this.find(id);
			}
		},
		highlightAt(node, point) {
			if (node === this._highlight.graphics) {
				return false;
			}
			if (node.containsPoint) {
				if (node.containsPoint(point)) {
					return node;
				}
			} else if (node.children && node.children.length) {
				for (var i = node.children.length - 1; i >= 0; i--) {
					var hit = this.highlightAt(node.children[i], point);
					if (hit) {
						return hit;
					}
				}
			}
			if (node.getBounds && node.getBounds().contains(point.x, point.y)) {
				return node;
			}
			return false;
		},
		selection() {
			if (!window.$pixi) {
				return null;
			}
			var formatted = {
				_inspector: window.$pixi._inspector
			};

			var properties = Object.keys(window.$pixi);

			if (formatted._inspector !== undefined && formatted._inspector.whitelist !== undefined) {
				properties = formatted._inspector.whitelist;
			}

			properties.forEach(property => {
				if (property[0] === '_' || ['children', 'parent'].indexOf(property) !== -1) {
					return;
				}
				var value = window.$pixi[property];
				var type = typeof value;
				if (type === 'string' || type === 'number' || type === 'boolean' || value === null) {
					formatted[property] = value
				} else if (type === 'object') {
					if (value.constructor === PIXI.Point) {
						this.selectionPartial(formatted, property + '.', value)
					} else if (value instanceof TransformBaseRef) {
						this.selectionPartial(formatted, property + '.position.', value.position)
						formatted[property + '.rotation'] = value.rotation;
						this.selectionPartial(formatted, property + '.skew.', value.skew)
						this.selectionPartial(formatted, property + '.scale.', value.scale)
					} else if (value instanceof ObservablePointRef) {
						this.selectionPartial(formatted, property + '.', value)
					} else {
						formatted[property] = '...' + (typeof value.constructor ? value.constructor.name : type)
					}
				} else {
					formatted[property] = '...' + type
				}
			});
			return formatted;
		},
		selectionPartial(formatted, path, object) {
			if (object instanceof ObservablePointRef) {
				formatted[path + 'x'] = object.x;
				formatted[path + 'y'] = object.y;
				return;
			}
			Object.keys(object).forEach(function (property) {
				if (property[0] === '_') {
					return;
				}
				var value = object[property];
				var type = typeof value;
				if (type === 'string' || type === 'number' || type === 'boolean' || value === null) {
					formatted[path + property] = value
				} else {
					formatted[path + property] = '...' + type
				}
			})
		},
		/**
		 * Get the surounding nodes (prev, next, parent. For tree keyboard navigation)
		 */
		context(id, tree) {
			tree = tree || this.tree();
			var context = {};
			if (tree.id === id) {
				if (!tree.collapsed && !tree.leaf) {
					context.next = tree.children[0].id;
				}
				return context;
			}
			if (!tree.collapsed && !tree.leaf) {
				var found = false;
				var prev = tree;
				for (var i in tree.children) {
					var node = tree.children[i];
					if (found) {
						context.next = node.id;
						return context;
					}
					context = this.context(id, node);
					if (context) {
						if (!context.parent && tree.type !== 'root') {
							context.parent = tree.id;
						}
						if (!context.prev && prev.type !== 'root') {
							context.prev = prev.id;
						}
						if (context.next) {
							return context;
						}
						found = true;
						continue; // collect context.next id
					}
					prev = node
				}
				if (found) {
					return context;
				}
			}
			return false;
		},
		find(id, node) {
			if (!node) {
				node = this.root;
			}
			if (!node._inspector) {
				return false;
			}
			if (node._inspector.id === id) {
				return node;
			}
			if (node.children) {
				var length = node.children.length;
				for (var i = 0; i < length; i++) {
					var found = this.find(id, node.children[i]);
					if (found) {
						return found;
					}
				}
			}
			return false;
		},
		node(node) {
			var inspector = node._inspector || {};

			var defaultTo = function (obj, prop, callback) {
				if (obj[prop] === undefined) {
					obj[prop] = callback();
				}
			};

			defaultTo(inspector, 'id', () => this.generateId());
			defaultTo(inspector, 'collapsed', () => true);
			defaultTo(inspector, 'type', () => this.detectType(node));

			node._inspector = inspector;

			var result = {
				id: inspector.id,
				type: inspector.type,
				leaf: (!node.children || node.children.length === 0),
				collapsed: inspector.collapsed,
				name: node.name
			};

			if (result.leaf === false && inspector.collapsed === false) {
				result.children = [];
				var length = node.children.length;
				for (var i = 0; i < length; i++) {
					result.children.push(this.node(node.children[i]));
				}
			}
			return result;
		},
		generateId() {
			this._autoincrement++;
			return this._autoincrement;
		},

		detectType(node) {
			if (!node.constructor) {
				return 'Unknown';
			}
			var index = this._typeMap.constructors.indexOf(node.constructor);
			if (index === -1) {
				return node.constructor.name;
			}
			return this._typeMap.names[index];
		},

		registerTypes(name, object, depth = 1) {
			if (depth === 0 || typeof object !== 'object') {
				return;
			}
			for (var prop in object) {
				if (typeof object[prop] === 'function') {
					this._typeMap.constructors.push(object[prop]);
					this._typeMap.names.push(name + '.' + prop);
				} else if (typeof object[prop] === 'object') {
					this.registerTypes(name + '.' + prop, object[prop], depth - 1);
				}
			}
		},

		use(_PIXI) {
			PIXI = _PIXI;
			inspector.patch(PIXI.CanvasRenderer);
			inspector.patch(PIXI.WebGLRenderer);
			// Prevent "Right-hand side of 'instanceof' is not an object" for older version of pixi
			TransformBaseRef = typeof PIXI.TransformBase === 'function' ? PIXI.TransformBase : MismatchConstructor;
			ObservablePointRef = typeof PIXI.ObservablePoint === 'function' ? PIXI.ObservablePoint : MismatchConstructor;
		}
	};
	inspector.use(PIXI);

	// Patch console.warn to hide
	var targetWindow = window
	var windowPath = path.match(/window.frames\[[0-9]+\]/)
	if (windowPath !== null) {
		targetWindow = eval(windowPath[0])
	}
	var _warn = targetWindow.console.warn
	var _groupCollapsed = targetWindow.console.groupCollapsed
	targetWindow.console.warn = function () { }
	targetWindow.console.groupCollapsed = false

	inspector.registerTypes('PIXI', PIXI, 2);
	if (path.substr(-5) === '.PIXI') {
		var windowPath = path.substr(0, path.length - 5);
		inspector.registerTypes('Phaser', eval(windowPath + '.Phaser || false'), 2); // Register Phaser types
		if (windowPath.substr(-5) === '.game') {
			inspector.registerTypes('game', eval(windowPath), 2); // Register Pandajs types
		}
	}
	targetWindow.console.warn = _warn
	targetWindow.console.warn = _groupCollapsed
	__PIXI_INSPECTOR_GLOBAL_HOOK__ = inspector;
}());
