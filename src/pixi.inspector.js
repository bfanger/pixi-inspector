(function () {
	if (typeof window.__PIXI_INSPECTOR_GLOBAL_HOOK__ === 'undefined') {
		throw new Error('PIXI must be detected before loading pixi.inspector.js')
	}
	if (typeof window.__PIXI_INSPECTOR_GLOBAL_HOOK__ === 'object') {
		console.log('Injected twice');
		return;
	}
	var path = window.__PIXI_INSPECTOR_GLOBAL_HOOK__;
	var PIXI = eval(window.__PIXI_INSPECTOR_GLOBAL_HOOK__);
	var Phaser = false;
	var game = false;
	if (path.substr(-5) === '.PIXI') {
		var windowPath = path.substr(0, path.length - 5);
		if (windowPath.substr(-5) === '.game') {
			game = eval(windowPath);
		} else {
			Phaser = eval(windowPath + '.Phaser || false');	
		}
	}

	var inspector = {
		
		highlight: PIXI.Graphics ? new PIXI.Graphics() : false, // Only supported in PIXI v3
	
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
		
		/**
		* Path the Renderer.render method to get a hold of the stage object(s)
		*/
		patch: function (renderer) {
			var _render = renderer.prototype.render;
			var self = this;
			renderer.prototype.render = function (stage) {
				self.beforeRender(stage, renderer);
				var retval = _render.apply(this, arguments);
				return self.afterRender(stage, renderer, retval);
			}
		},
		/**
		* An intercepted render call
		*/
		beforeRender: function (stage, renderer) {
			if (this.root.children.indexOf(stage) === -1) {
				this.root.children.push(stage);
				if (!window.$pixi) {
					window.$pixi = stage;
				}
				// @todo remove stages after an idle period
			}
			var hl = this.highlight;
			if (hl && window.$pixi && $pixi.parent && $pixi.getBounds) {
				hl.clear();
				hl.beginFill(0x00007eff, 0.3);
				hl.lineStyle(1, 0x00007eff, 0.6);
				var bounds = $pixi.getBounds();
				// Using localBounds gives rotation to the highlight, but needs to take the container transformations into account to work propertly.
				// var bounds = $pixi.getLocalBounds(); 
				// hl.position = $pixi.position.clone();
				// hl.rotation = $pixi.rotation;
				// hl.scale = $pixi.scale.clone();
				// var parentBounds = $pixi.parent.getBounds();
				hl.drawRect(bounds.x, bounds.y, bounds.width, bounds.height);
				hl.endFill();
				stage.addChild(hl);
				hl._inspectorAdded = true;
			}
		},
		afterRender: function (stage, renderer, retval) {
			if (this.highlight && this.highlight._inspectorAdded) {
				stage.removeChild(this.highlight);
				this.highlight._inspectorAdded = false;
			}
			return retval;
		},
		/**
		* Aggregate results  for services/scene.js
		*/
		scene: function () {
			if (!window.$pixi) {
				return {
					tree: this.tree(),
					selected: false,
					context: {}
				};
			}
			return {
				tree: this.tree(),
				selected: this.selection(),
				context: this.context(window.$pixi._inspector.id)
			};
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
			window.$pixi = this.find(id);
			return this.selection();
		},
		selection: function () {
			if (!window.$pixi) {
				return null;
			}
			var formatted = {
				_inspector: window.$pixi._inspector
			};
			Object.keys(window.$pixi).forEach(function (property) {
				if (property[0] === '_' || ['children', 'parent'].indexOf(property) !== -1) {
					return;
				}
				var value = window.$pixi[property];
				var type = typeof value;
				if (type === 'string' || type === 'number') {
					formatted[property] = value
				} else if (type === 'boolean') {
					formatted[property] = value ? 'true' : 'false'
				} else if (value === null) {
					formatted[property] = 'null';
				} else if (type === 'object' && value.constructor === PIXI.Point) {
					Object.keys(value).forEach(function (_property) {
						var _value = value[_property];
						var _type = typeof _value;
						if (_type === 'string' || _type === 'number') {
							formatted[property + '.' + _property] = _value
						} else if (_type === 'boolean') {
							formatted[property + '.' + _property] = _value ? 'true' : 'false'
						} else {
							formatted[property + '.' + _property] = '...' + _type
						}
					})
				} else {
					formatted[property] = '...' + type
				}
			});
			return formatted;
		},
		/**
		* Get the surounding nodes (prev, next, parent. For tree keyboard navigation)
		*/
		context: function (id, tree) {
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
					var found = this.find(id, node.children[i]);
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
			}
			var versionMajor = parseInt(PIXI.VERSION, 10) || 1; 
			if (versionMajor < 3) { // Deprecated (PIXI v2)
				switch (node.constructor) {
					case PIXI.Stage: return 'PIXI.Stage';
					case PIXI.Rope: return 'PIXI.Rope';
					case PIXI.DisplayObjectContainer: return 'PIXI.DisplayObjectContainer';
					case PIXI.MovieClip: return "PIXI.MovieClip";
					case PIXI.BitmapText: return "PIXI.BitmapText";
					case PIXI.EmptyRectangle: return "PIXI.EmptyRectangle";
					case PIXI.Matrix2: return "PIXI.Matrix2";
					case PIXI.FilterBlock: return "PIXI.FilterBlock";
					case PIXI.InteractionData: return "PIXI.InteractionData";
					case PIXI.InteractionManager: return "PIXI.InteractionManager";
					case PIXI.AjaxRequest: return "PIXI.AjaxRequest";
					case PIXI.EventTarget: return "PIXI.EventTarget";
					case PIXI.PolyK: return "PIXI.PolyK";
					case PIXI.CompileVertexShader: return "PIXI.CompileVertexShader";
					case PIXI.CompileFragmentShader: return "PIXI.CompileFragmentShader";
					case PIXI.PixiShader: return "PIXI.PixiShader";
					case PIXI.PixiFastShader: return "PIXI.PixiFastShader";
					case PIXI.StripShader: return "PIXI.StripShader";
					case PIXI.PrimitiveShader: return "PIXI.PrimitiveShader";
					case PIXI.WebGLGraphics: return "PIXI.WebGLGraphics";
					case PIXI.WebGLMaskManager: return "PIXI.WebGLMaskManager";
					case PIXI.WebGLShaderManager: return "PIXI.WebGLShaderManager";
					case PIXI.WebGLSpriteBatch: return "PIXI.WebGLSpriteBatch";
					case PIXI.WebGLFastSpriteBatch: return "PIXI.WebGLFastSpriteBatch";
					case PIXI.WebGLFilterManager: return "PIXI.WebGLFilterManager";
					case PIXI.FilterTexture: return "PIXI.FilterTexture";
					case PIXI.CanvasMaskManager: return "PIXI.CanvasMaskManager";
					case PIXI.CanvasTinter: return "PIXI.CanvasTinter";
					case PIXI.Strip: return "PIXI.Strip";
					case PIXI.TilingSprite: return "PIXI.TilingSprite";
					case PIXI.AnimCache: return "PIXI.AnimCache";
					case PIXI.Spine: return "PIXI.Spine";
					case PIXI.BaseTextureCache: return "PIXI.BaseTextureCache";
					case PIXI.BaseTextureCacheIdGenerator: return "PIXI.BaseTextureCacheIdGenerator";
					case PIXI.TextureCache: return "PIXI.TextureCache";
					case PIXI.FrameCache: return "PIXI.FrameCache";
					case PIXI.TextureCacheIdGenerator: return "PIXI.TextureCacheIdGenerator";
					case PIXI.JsonLoader: return "PIXI.JsonLoader";
					case PIXI.AtlasLoader: return "PIXI.AtlasLoader";
					case PIXI.SpriteSheetLoader: return "PIXI.SpriteSheetLoader";
					case PIXI.ImageLoader: return "PIXI.ImageLoader";
					case PIXI.BitmapFontLoader: return "PIXI.BitmapFontLoader";
					case PIXI.SpineLoader: return "PIXI.SpineLoader";
					case PIXI.AlphaMaskFilter: return "PIXI.AlphaMaskFilter";
					case PIXI.ColorMatrixFilter: return "PIXI.ColorMatrixFilter";
					case PIXI.GrayFilter: return "PIXI.GrayFilter";
					case PIXI.DisplacementFilter: return "PIXI.DisplacementFilter";
					case PIXI.PixelateFilter: return "PIXI.PixelateFilter";
					case PIXI.BlurXFilter: return "PIXI.BlurXFilter";
					case PIXI.BlurYFilter: return "PIXI.BlurYFilter";
					case PIXI.BlurFilter: return "PIXI.BlurFilter";
					case PIXI.InvertFilter: return "PIXI.InvertFilter";
					case PIXI.SepiaFilter: return "PIXI.SepiaFilter";
					case PIXI.TwistFilter: return "PIXI.TwistFilter";
					case PIXI.ColorStepFilter: return "PIXI.ColorStepFilter";
					case PIXI.DotScreenFilter: return "PIXI.DotScreenFilter";
					case PIXI.CrossHatchFilter: return "PIXI.CrossHatchFilter";
					case PIXI.RGBSplitFilter: return "PIXI.RGBSplitFilter";
				}
			}
			if (PIXI.mesh) {
				switch (node.constructor) {
					case PIXI.mesh.Mesh: return 'PIXI.mesh.Mesh';
					case PIXI.mesh.Rope: return 'PIXI.mesh.Rope';
					case PIXI.mesh.MeshRenderer: return 'PIXI.mesh.MeshRenderer';
					case PIXI.mesh.MeshShader: return 'PIXI.mesh.MeshShader';
				}
			}
			if (PIXI.extras) {
				switch (node.constructor) {
					case PIXI.extras.MovieClip: return 'PIXI.extras.MovieClip';
					case PIXI.extras.TilingSprite: return 'PIXI.extras.TilingSprite';
					case PIXI.extras.BitmapText: return 'PIXI.extras.BitmapText';
				}
			}
			if (PIXI.spine) {
				switch (node.constructor) {
					case PIXI.spine.Spine: return 'PIXI.spine.Spine';
					case PIXI.spine.SpineRuntime: return 'PIXI.spine.SpineRuntime';
				}
			}
			if (Phaser) {
				switch (node.constructor) {
					case Phaser.Sprite: return 'Phaser.Sprite';
					case Phaser.Image: return 'Phaser.Image';
					case Phaser.Stage: return 'Phaser.Stage';
					case Phaser.Group: return 'Phaser.Group';
					case Phaser.Animation: return 'Phaser.Animation';
					case Phaser.Video: return 'Phaser.Video';
					case Phaser.Circle: return 'Phaser.Circle';
					case Phaser.Ellipse: return 'Phaser.Ellipse';
					case Phaser.Line: return 'Phaser.Line';
					case Phaser.Point: return 'Phaser.Point';
					case Phaser.Polygon: return 'Phaser.Polygon';
					case Phaser.Rectangle: return 'Phaser.Rectangle';
					case Phaser.RoundedRectangle: return 'Phaser.RoundedRectangle';
					case Phaser.Camera: return 'Phaser.Camera';
					case Phaser.World: return 'Phaser.World';
					case Phaser.FlexGrid: return 'Phaser.FlexGrid';
					case Phaser.FlexLayer: return 'Phaser.FlexLayer';
					case Phaser.Component: return 'Phaser.Component';
					case Phaser.TileSprite: return 'Phaser.TileSprite';
					case Phaser.Rope: return 'Phaser.Rope';
					case Phaser.Button: return 'Phaser.Button';
					case Phaser.SpriteBatch: return 'Phaser.SpriteBatch';
					case Phaser.Particle: return 'Phaser.Particle';
					case Phaser.BitmapData: return 'Phaser.BitmapData';
					case Phaser.Graphics: return 'Phaser.Graphics';
					case Phaser.RenderTexture: return 'Phaser.RenderTexture';
					case Phaser.Text: return 'Phaser.Text';
					case Phaser.BitmapText: return 'Phaser.BitmapText';
					case Phaser.RetroFont: return 'Phaser.RetroFont';
					case Phaser.Device: return 'Phaser.Device';
					case Phaser.DOM: return 'Phaser.DOM';
					case Phaser.Canvas: return 'Phaser.Canvas';
					case Phaser.RequestAnimationFrame: return 'Phaser.RequestAnimationFrame';
					case Phaser.Math: return 'Phaser.Math';
					case Phaser.RandomDataGenerator: return 'Phaser.RandomDataGenerator';
					case Phaser.QuadTree: return 'Phaser.QuadTree';
					case Phaser.Frame: return 'Phaser.Frame';
					case Phaser.FrameData: return 'Phaser.FrameData';
					case Phaser.AudioSprite: return 'Phaser.AudioSprite';
					case Phaser.Sound: return 'Phaser.Sound';
					case Phaser.Color: return 'Phaser.Color';
					case Phaser.LinkedList: return 'Phaser.LinkedList';
					case Phaser.ImageCollection: return 'Phaser.ImageCollection';
					case Phaser.Tile: return 'Phaser.Tile';
					case Phaser.Tilemap: return 'Phaser.Tilemap';
					case Phaser.TilemapLayer: return 'Phaser.TilemapLayer';
					case Phaser.Tileset: return 'Phaser.Tileset';
					case Phaser.Particles: return 'Phaser.Particles';
				}
			}
			if (game) { // Panda.js
				switch (node.constructor) {
					case game.Class: return 'game.Class';
					case game.Fader: return 'game.Fader';
					case game.Analytics: return 'game.Analytics';
					case game.Camera: return 'game.Camera';
					case game.Audio: return 'game.Audio';
					case game.Particle: return 'game.Particle';
					case game.Emitter: return 'game.Emitter';
					case game.Pool: return 'game.Pool';
					case game.World: return 'game.World';
					case game.Body: return 'game.Body';
					case game.Rectangle: return 'game.Rectangle';
					case game.Circle: return 'game.Circle';
					case game.Line: return 'game.Line';
					case game.Vector: return 'game.Vector';
					case game.Scene: return 'game.Scene';
					case game.Storage: return 'game.Storage';
					case game.System: return 'game.System';
					case game.SceneStage01: return 'game.SceneStage01';
					case game.SceneStage06: return 'game.SceneStage06';
					case game.SceneStage11: return 'game.SceneStage11';
					case game.SceneStage16: return 'game.SceneStage16';
					case game.SceneStage02: return 'game.SceneStage02';
					case game.SceneStage07: return 'game.SceneStage07';
					case game.SceneStage12: return 'game.SceneStage12';
					case game.SceneStage17: return 'game.SceneStage17';
					case game.SceneStage03: return 'game.SceneStage03';
					case game.SceneStage08: return 'game.SceneStage08';
					case game.SceneStage13: return 'game.SceneStage13';
					case game.SceneStage18: return 'game.SceneStage18';
					case game.SceneStage04: return 'game.SceneStage04';
					case game.SceneStage09: return 'game.SceneStage09';
					case game.SceneStage14: return 'game.SceneStage14';
					case game.SceneStage19: return 'game.SceneStage19';
					case game.SceneStage05: return 'game.SceneStage05';
					case game.SceneStage10: return 'game.SceneStage10';
					case game.SceneStage15: return 'game.SceneStage15';
					case game.SceneStage20: return 'game.SceneStage20';
					case game.SceneEndtro: return 'game.SceneEndtro';
					case game.Debug: return 'game.Debug';
					case game.DebugDraw: return 'game.DebugDraw';
					case game.AssetLoader: return 'game.AssetLoader';
					case game.Text: return 'game.Text';
					case game.HitRectangle: return 'game.HitRectangle';
					case game.HitCircle: return 'game.HitCircle';
					case game.HitEllipse: return 'game.HitEllipse';
					case game.HitPolygon: return 'game.HitPolygon';
					case game.TextureCache: return 'game.TextureCache';
					case game.RenderTexture: return 'game.RenderTexture';
					case game.Point: return 'game.Point';
					case game.Stage: return 'game.Stage';
					case game.BaseTexture: return 'game.BaseTexture';
					case game.Sprite: return 'game.Sprite';
					case game.SpriteSheet: return 'game.SpriteSheet';
					case game.Graphics: return 'game.Graphics';
					case game.BitmapText: return 'game.BitmapText';
					case game.Spine: return 'game.Spine';
					case game.Container: return 'game.Container';
					case game.Texture: return 'game.Texture';
					case game.TilingSprite: return 'game.TilingSprite';
					case game.Animation: return 'game.Animation';
					case game.Video: return 'game.Video';
					case game.SceneMain: return 'game.SceneMain';
				}
			}
			return 'Unknown';
	
		},
		
		use: function (_PIXI) {
			PIXI = _PIXI;
			inspector.patch(PIXI.CanvasRenderer);
			inspector.patch(PIXI.WebGLRenderer);
		}
	};
	inspector.use(PIXI);
	__PIXI_INSPECTOR_GLOBAL_HOOK__ = inspector;
}());