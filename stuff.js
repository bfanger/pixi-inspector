var {Observable} = require('rx');
var detectPixi = require('./detectPixi')
var proxy = require('./proxy')

var injectInspector = detectPixi.flatMap(function (path) {
	return proxy.eval('window._pixiInspector = "' + path + '"').then(function () {
		return proxy.injectScript('pixi.inspector.js');
	});
}).flatMap(function () {
	return Observable.defer(function () {
		return proxy.eval('typeof window._pixiInspector === "object"').then(function (loaded) {;
			if (!loaded) {
				throw new Error('Script not yet executed');
			};
			return '_pixiInspector';
		});
	}).retryWhen(function (errors) {
		return errors.delay(100);
	});
});

module.exports = injectInspector;var proxy = require('./proxy');

/**
 * Async access to the PIXI.inspector which works in both browser and devtool panel environments.
 */
var inspectorProxy = {
	refresh: function () {
		return proxy.apply('_pixiInspector', 'refresh');
	},
	tree: function () {
		return proxy.apply('_pixiInspector', 'tree');
	},
	expand: function (id) {
		return proxy.apply('_pixiInspector', 'expand', [id]);
	},
	collapse: function (id) {
		return proxy.apply('_pixiInspector', 'collapse', [id]);
	},
	select: function (id) {
		return proxy.apply('_pixiInspector', 'select', [id]);
	},
	selection: function () {
		return proxy.apply('_pixiInspector', 'selection');
	},
	context: function (id) {
		return proxy.apply('_pixiInspector', 'context', [id]);
	}
};
module.exports = inspectorProxy;# Pixi Inspector

A extension to the Chrome DevTools for inspecting Pixi.js games/applications.

## Installation

Install (Pixi Inspector from the Chrome Web Store)[https://chrome.google.com/webstore/detail/pixi-inspector/aamddddknhcagpehecnhphigffljadon]

## Features

* Shows the scene graph
* Shows property values of the selected node (read-only)
* Highlight (the bounds of) the selected node
* The selected node is available in the Console as `$pixi`


<<<<<<< HEAD
## Build instructions 

Install nodejs and dependancies: `npm install && npm install -g gulp` 

### Debugging/Testing
Run `gulp webpack-dev-server` and open http://localhost:8090/webpack-dev-server/tests/ in any browser.

### Rebuild chrome extension on every filechange:
`gulp continuous-build`

### Building chrome extension once:
`gulp build`
=======
## Build Source Code for Development

* `git clone git@github.com:bfanger/pixi-inspector.git`
* `cd pixi-inspector`
* `npm install`
* `npm run build`


## Build Source Code for Production

* `git clone git@github.com:bfanger/pixi-inspector.git`
* `cd pixi-inspector`
* `npm install`
* `npm run buildProduction`
>>>>>>> 2b9459fdaa53ac8c43b2863e70ab669d48b08ea9
require("./PixiPanel.scss");
var React = require("react");
var inspector = require("../services/inspectorProxy");
var PixiTree = require("./PixiTree");
var DetailView = require("./DetailView");
var SplitView = require("./SplitView");
var proxy = require("../services/proxy");
var tree = require("../services/tree");

proxy.BASE = 'http://localhost/pixi-inspector/src/';
// require('../pixi.inspector'); // Enable for livereload
var DEBUG = false;

var PixiPanel = React.createClass({

	getInitialState: function () {
		var state = {
			tree: false,
			selected: false,
			pixiDetected: false
		}
		return state;
	},
	render: function () {
		var tree = this.state.tree;
		var reboot = DEBUG ? <span onClick={this.reboot}>[ reboot {this.state.error} ]</span> : <span>{this.state.error}</span>;
		if (!tree) {
			return <div className="pixi-panel__error">{reboot} {this.state.pixiDetected ? 'No stages rendered.' : 'Pixi.js not detected.'}</div>
		}
		var selected = this.state.selected;
		var selectedId = selected ? selected._inspector.id : false;
		var context = this.state.context || {};
		return <span className="pixi-panel">{reboot}<SplitView>
			<PixiTree tree={tree} selectedId={selectedId} context={context} onRefresh={this.refresh} />
			{selected ? <DetailView data={selected} />: ''}
		</SplitView></span>
	},
	componentDidMount: function () {
		this.treeSubscription = tree.subscribe( tree => {
			this.setState({
				pixiDetected: true,
				tree: tree
			});
			console.log('tree', tree)
		}, function (error) {
			console.warn(error);
		}, function () {
			console.info('complete');
		})

	},
	componentWillUnmount: function () {
		this.treeSubscription.dispose();
	},
	refresh: function (e) {
		inspector.refresh().then( (state) => {
			this.setState(state);
		}, (error) => {
			// Probably a page-refresh
			this.setState({
				pixiDetected: false,
				tree: false,
				selected: false
			});
			clearTimeout(this.timeout);
			proxy.eval('window.PIXI ? (PIXI.inspector ? "INSPECTOR": "PIXI") : false').then( (detected) => {
				if (detected === 'INSPECTOR')  {
					this.setState({error: error});
				} else {
					this.detectTimeout = 250;
					this.detectPixi();
				}
			});
		})
	},
	reboot: function () {
		location.reload();
	}
});
module.exports = PixiPanel;# Pixi Inspector

A extension to the Chrome DevTools for inspecting Pixi.js games/applications.

## Installation

* Download from: https://github.com/csomakk/pixi-inspector/raw/master/release/pixiinspector.crx
* Open url: chrome://extensions
* Enable developer mode
* Drag the installer to the page to install. (You might need to drag it from Finder, not from Chrome)

## Features

* Shows the scene graph
* Shows property values of the selected node (read-only)
* Highlight (the bounds of) the selected node
* The selected node is available in the Console as `$pixi`
<<<<<<< HEAD


## Build Source Code for Development

* `git clone git@github.com:bfanger/pixi-inspector.git`
* `cd pixi-inspector`
* `npm install`
* `npm run build`


## Build Source Code for Production

* `git clone git@github.com:bfanger/pixi-inspector.git`
* `cd pixi-inspector`
* `npm install`
* `npm run buildProduction`
=======
* Edit text and number values
>>>>>>> e0e2c2c2f3d5b639158e3ae6d58d4da2b018eac9
# Pixi Inspector

A extension to the Chrome DevTools for inspecting Pixi.js games/applications.

## Installation

Install (Pixi Inspector from the Chrome Web Store)[https://chrome.google.com/webstore/detail/pixi-inspector/aamddddknhcagpehecnhphigffljadon]

## Features

* Shows the scene graph
* Shows property values of the selected node (read-only)
* Highlight (the bounds of) the selected node
* The selected node is available in the Console as `$pixi`


<<<<<<< HEAD
## Build from source
 
* git clone git@github.com:bfanger/pixi-inspector.git
* cd pixi-inspector
* npm install
* npm install -g gulp
* npm run build
* Go to [chrome://extensions/](chrome://extensions/), click `load unpacked extension...` and browse to the build folder. 
 
### Development

Run `gulp webpack-dev-server` and open http://localhost:8090/webpack-dev-server/tests/ (or http://localhost:8090/tests/)

This loads the pixi-inspector into the same page as an example PIXI scene, which makes debugging easier. 
However in the chrome-extension environment, you don't have direct access to the PIXI object or console.log (pixi.inspector.js in an exception)
Use the [proxy](services/proxy.js) service to interact with the inspected page. 

When the inspector works in the test environment run:  
`gulp continuous-build`
Set `var DEBUG = true;` in [PixiPanel](components/PixiPanel.js) which adds a button to load the changed code.
=======
## Build instructions 

Install nodejs and dependancies: `npm install && npm install -g gulp` 

### Debugging/Testing
Run `gulp webpack-dev-server` and open http://localhost:8090/webpack-dev-server/tests/ in any browser.

### Rebuild chrome extension on every filechange:
`gulp continuous-build`

### Building chrome extension once:
`gulp build`
>>>>>>> origin/rx
var {Observable} = require('rx');
var injectInspector = require('./injectInspector');
var inspectorProxy = require('./inspectorProxy');

module.exports = injectInspector.flatMap(function () {
	return Observable.interval(1000).flatMap(function () {
		return inspectorProxy.tree();
	}) 
});<!DOCTYPE html>
<html>
<head>
    <title>Pixi Inspector</title>
</head>
<body>
    <canvas id="example" style="float: left; margin-right: 40px"></canvas>
    <script src="http://localhost:8090/node_modules/pixi.js/bin/pixi.min.js"></script>
    <script>
        var viewWidth = 480;
        var viewHeight = 360;

        var renderer = PIXI.autoDetectRenderer(viewWidth, viewHeight, {
            backgroundColor : 0xFFFFFF, //0x1099bb,
             view: document.getElementById('example')
         });

        
        
        // create an new instance of a pixi stage
        var stage = new PIXI.Container();



        // create a background texture
        var pondFloorTexture = PIXI.Texture.fromImage("http://www.goodboydigital.com/pixijs/examples/17/BGrotate.jpg");
        // create a new background sprite
        var pondFloorSprite = new PIXI.Sprite(pondFloorTexture);
        stage.addChild(pondFloorSprite);

        
        var dudesContainer = new PIXI.Container();
        stage.addChild(dudesContainer);
        // create an array to store a refference to the fish in the pond
        var dudeArray = [];
         
        var totalDude = 10;

        for (var i = 0; i < totalDude; i++) 
        {

            // create a new Sprite that uses the image name that we just generated as its source
            var dude =  PIXI.Sprite.fromImage("http://www.goodboydigital.com/pixijs/examples/17/eggHead.png");

            // set the anchor point so the the dude texture is centerd on the sprite
            dude.anchor.x = dude.anchor.y = 0.5;

            // set a random scale for the dude - no point them all being the same size!
            dude.scale.x = dude.scale.y = 0.8 + Math.random() * 0.3;
            
            // finally lets set the dude to be a random position..
            dude.position.x = Math.random() * viewWidth;
            dude.position.y = Math.random() * viewHeight;
        
            // time to add the dude to the pond container!
            dudesContainer.addChild(dude);

            // create some extra properties that will control movment

            dude.tint = Math.random() * 0xFFFFFF;

            // create a random direction in radians. This is a number between 0 and PI*2 which is the equivalent of 0 - 360 degrees
            dude.direction = Math.random() * Math.PI * 2;

            // this number will be used to modify the direction of the dude over time
            dude.turningSpeed = Math.random() - 0.8;

            // create a random speed for the dude between 0 - 2
            dude.speed = 2 + Math.random() * 2; 

            // finally we push the dude into the dudeArray so it it can be easily accessed later
            dudeArray.push(dude);

        }

        // create a bounding box box for the little dudes 
        var dudeBoundsPadding = 100;
        var dudeBounds = new PIXI.Rectangle(-dudeBoundsPadding,
                                            -dudeBoundsPadding, 
                                            viewWidth + dudeBoundsPadding * 2, 
                                            viewHeight + dudeBoundsPadding * 2);

        

        // create a displacment map


        var tick = 0;
        requestAnimationFrame(animate);

        function animate() 
        {
            // iterate through the dude and update the positiond
            for (var i = 0; i < dudeArray.length; i++) 
            {
                var dude = dudeArray[i];
                dude.direction += dude.turningSpeed * 0.01;
                dude.position.x += Math.sin(dude.direction) * dude.speed;
                dude.position.y += Math.cos(dude.direction) * dude.speed;
                dude.rotation = -dude.direction - Math.PI/2;

                // wrap the dudes by testing there bounds..
                if(dude.position.x < dudeBounds.x)dude.position.x += dudeBounds.width;
                else if(dude.position.x > dudeBounds.x + dudeBounds.width)dude.position.x -= dudeBounds.width
                
                if(dude.position.y < dudeBounds.y)dude.position.y += dudeBounds.height;
                else if(dude.position.y > dudeBounds.y + dudeBounds.height)dude.position.y -= dudeBounds.height
            }
            
            // increment the ticker
            tick += 0.1;
            
            
            
            // time to render the state!
            renderer.render(stage);
            
            // request another animation frame..
            requestAnimationFrame( animate );
        }

    </script>

    <div style="float: left; border: 1px solid gray; padding: 10px;">
        <div id="devpanel">
            <!-- this is where the root react component will get rendered -->
        </div>
    </div>
    
    <script src="http://localhost:8090/node_modules/react/dist/react-with-addons.js"></script>
    <script src="http://localhost:8090/node_modules/react-dom/dist/react-dom.js"></script>
    <script src="http://localhost:8090/node_modules/rx/dist/rx.all.js"></script>

    <script src="http://localhost:8090/webpack-dev-server.js"></script>

    <!--<script type="text/javascript" src="http://localhost:8090/pixi-panel.js"></script>-->

</body>
</html>
require("./PixiPanel.scss");
var React = require("react");
var {Observable} = require("rx");
var inspector = require("../services/inspectorProxy");
var PixiTree = require("./PixiTree");
var DetailView = require("./DetailView");
var SplitView = require("./SplitView");
var proxy = require("../services/proxy");
var state = require("../services/state");
var detectPixi = require("../services/detectPixi");

proxy.BASE = 'http://localhost/pixi-inspector/src/';
// require('../pixi.inspector'); // Enable for livereload
var DEBUG = false;

var PixiPanel = React.createClass({

	getInitialState: function () {
		var state = {
			tree: false,
			selected: false,
			pixiDetected: false
		}
		return state;
	},
	render: function () {
		var tree = this.state.tree;
		var reboot = DEBUG ? <span onClick={this.reboot}>[ reboot {this.state.error} ]</span> : <span>{this.state.error}</span>;
		if (!tree) {
			return <div className="pixi-panel__error">{reboot} {this.state.pixiDetected ? 'No stages rendered.' : 'Pixi.js not detected.'}</div>
		}
		var selected = this.state.selected;
		var selectedId = selected ? selected._inspector.id : false;
		var context = this.state.context || {};
		return <span className="pixi-panel">{reboot}<SplitView>
			<PixiTree tree={tree} selectedId={selectedId} context={context} onRefresh={this.refresh} />
			{selected ? <DetailView data={selected} />: ''}
		</SplitView></span>
	},
	componentDidMount: function () {
		this.detectPixiSubscription = detectPixi.subscribe( () => {
			this.setState({pixiDetected: true});
		});
		this.stateSubscription = state.subscribe( current => {
			this.setState(current);
		}, (error) => {
			console.error(error);
		}, function () {
			console.info('complete');
		})
	},
	componentWillUnmount: function () {
		this.stateSubscription.dispose();
		this.detectPixiSubscription.dispose();
	},
	refresh: function () {
	  	state.forceRefresh();
	},
	reboot: function () {
		location.reload();
	}
});
module.exports = PixiPanel;(function (path) {
	if (typeof window._pixiInspector === 'object') {
		console.warn('pixi.inspector script was already injected');
		return;
	}
	if (typeof window._pixiInspector !== 'string') {
		console.warn('_pixiInspector must point to the PIXI instance');
	}
	var PIXI = eval(path);
	window._pixiInspector = {
		
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
		* Agregate results needed for a PixiPanel.refresh()
		*/
		refresh: function () {
			if (!window.$pixi) {
				return {
					tree: this.tree(),
					selected: false,
					context: {},	
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
			})
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
				// Deprecated (PIXI v2)
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
				case PIXI.Rope: return "PIXI.Rope";
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
			if (window.Phaser) {
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
			if (window.game) { // Panda.js
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
	
		}
	};
	window._pixiInspector.patch(PIXI.CanvasRenderer);
	window._pixiInspector.patch(PIXI.WebGLRenderer);
}(window._pixiInspector));
