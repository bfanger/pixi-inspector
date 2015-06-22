var pixiAgent = {

	/**
	 * Check every x ms if PIXI is loaded on the page
	 */
	detectInterval: 5000,

	/**
	 * Emit a PIXI.refresh evert every x ms.
	 * 0 = on every render
	 */
	refreshInterval: 300,

	_lastRefresh: Date.now(),

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
	selected: false,
	
	/**
	 * Detect if the page uses PIXI
	 */
	detect: function () {
		var self = this;
		if (window.PIXI) {
			self.patch(window.PIXI);
		} else {
			document.addEventListener('DOMContentLoaded', function () {
				if (window.PIXI) {
					self.patch(window.PIXI);
				} else {
					var interval = setInterval(function () {
						if (window.PIXI) {
							clearInterval(interval);
							self.patch(window.PIXI);
						}
					}, self.detectInterval);
				}
			}, false);
		}
	},
	/**
	 * Add instrumentation to PIXI
	 */
	patch: function (PIXI) {
		this.patchRender(PIXI.CanvasRenderer);
		this.patchRender(PIXI.WebGLRenderer);
	},
	/**
	 * Path the Renderer.render method to get a hold of the stage object(s)
	 */
	patchRender: function (renderer) {
		var _render = renderer.prototype.render;
		var self = this;
		renderer.prototype.render = function (stage) {
			self.render(stage, renderer);
			return _render.apply(this, arguments);
		}
	},
	/**
	 * An intercepted render call
	 */
	render: function (stage, renderer) {
		if (this.root.children.indexOf(stage) === -1) {
			this.root.children.push(stage);
		}
		var now = Date.now()
		if (this._lastRefresh + this.refreshInterval < now) {
			this._lastRefresh = now;
			window.dispatchEvent(new Event('PIXI.refresh'));
		}
	},
	tree: function () {
		return this.node(this.root);
	},
	expand: function (id) {
		var node = this.find(id);
		if (node) {
			node._inspector.collapsed = false;
		}
	},
	collapse: function (id) {
		var node = this.find(id);
		if (node) {
			node._inspector.collapsed = true;
		}
	},
	select: function (id) {
		this.selected = this.find(id);
	},
	selection: function () {
		return this.selected;
	},
	find: function (id, node) {
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
				var found = this.find(id, node.children[i])
				if (found) {
					return found;
				}
			}
		}
		return false;
	},
	node: function (node) {
		var inspector = node._inspector;
		if (!inspector) {
			inspector = {
				id: this.generateId(),
				collapsed: true,
				type: this.detectType(node)
			};
			node._inspector = inspector;
		}
		var result = {
			id: inspector.id,
			type: inspector.type,
			leaf: (!node.children || node.children.length === 0),
			collapsed: inspector.collapsed,
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
	_autoincrement: 1,
	generateId: function () {
		this._autoincrement++;
		return this._autoincrement;
	}, 
	detectType: function (node) {
		if (!node.constructor) {
			return 'Unknown';
		}
		switch (node.constructor) {
			case PIXI.Sprite: return 'PIXI.Sprite';
			case PIXI.Container: return 'PIXI.Container';
			case PIXI.DisplayObject: return 'PIXI.DisplayObject';
			case PIXI.Circle: return 'PIXI.Circle';
			case PIXI.Ellipse: return 'PIXI.Ellipse';
			case PIXI.Polygon: return 'PIXI.Polygon';
			case PIXI.Rectangle: return 'PIXI.Rectangle';
			case PIXI.RoundedRectangle: return 'PIXI.RoundedRectangle';
			case PIXI.DisplayObject: return 'PIXI.DisplayObject';
			case PIXI.ParticleContainer: return 'PIXI.ParticleContainer';
			case PIXI.SpriteRenderer: return 'PIXI.SpriteRenderer';
			case PIXI.ParticleRenderer: return 'PIXI.ParticleRenderer';
			case PIXI.Text: return 'PIXI.Text';
			case PIXI.Graphics: return 'PIXI.Graphics';
			case PIXI.GraphicsData: return 'PIXI.GraphicsData';
			case PIXI.GraphicsRenderer: return 'PIXI.GraphicsRenderer';
			case PIXI.Texture: return 'PIXI.Texture';
			case PIXI.BaseTexture: return 'PIXI.BaseTexture';
			case PIXI.RenderTexture: return 'PIXI.RenderTexture';
			case PIXI.VideoBaseTexture: return 'PIXI.VideoBaseTexture';
			case PIXI.TextureUvs: return 'PIXI.TextureUvs';
			case PIXI.CanvasRenderer: return 'PIXI.CanvasRenderer';
			case PIXI.CanvasGraphics: return 'PIXI.CanvasGraphics';
			case PIXI.CanvasBuffer: return 'PIXI.CanvasBuffer';
			case PIXI.WebGLRenderer: return 'PIXI.WebGLRenderer';
			case PIXI.ShaderManager: return 'PIXI.ShaderManager';
			case PIXI.Shader: return 'PIXI.Shader';
			case PIXI.ObjectRenderer: return 'PIXI.ObjectRenderer';
			case PIXI.RenderTarget: return 'PIXI.RenderTarget';
			case PIXI.AbstractFilter: return 'PIXI.AbstractFilter';
			case PIXI.SpriteBatch: return 'PIXI.SpriteBatch';
			case PIXI.AssetLoader: return 'PIXI.AssetLoader';

			case PIXI.mesh.Mesh: return 'PIXI.mesh.Mesh';
			case PIXI.mesh.Rope: return 'PIXI.mesh.Rope';
			case PIXI.mesh.MeshRenderer: return 'PIXI.mesh.MeshRenderer';
			case PIXI.mesh.MeshShader: return 'PIXI.mesh.MeshShader';

			case PIXI.extras.MovieClip: return 'PIXI.extras.MovieClip';
			case PIXI.extras.TilingSprite: return 'PIXI.extras.TilingSprite';
			case PIXI.extras.BitmapText: return 'PIXI.extras.BitmapText';
			
		}
		if (PIXI.spine) {
			switch (node.constructor) {
				case PIXI.spine.Spine: return 'PIXI.spine.Spine';
				case PIXI.spine.SpineRuntime: return 'PIXI.spine.SpineRuntime';
			}
		}
		return 'Unknown';

	}
};

pixiAgent.detect();

if (typeof module !== 'undefined') {
	module.exports = pixiAgent;
}