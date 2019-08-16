import { ReplaySubject } from "rxjs";
import TypeDetection from "./TypeDetection";
import Outliner from "./InspectorOutliner";
import Properties from "./InspectorProperties";
import Gui from "./InspectorGui";
import Highlight from "./InspectorHighlight";
import runHooks from "./runHooks";

export default class Inspector {
  constructor(instance, emit) {
    this.instance = instance;
    this.emit = emit;
    this.unpatched = {};
    this.hooks = {
      beforeRender: [],
      afterRender: []
    };
    this.enabled$ = new ReplaySubject(1);

    // Register types
    this.typeDetection = new TypeDetection();
    const console = window.console;
    window.console = {
      warn() {
        // Prevent lots of "Deprecation Warning: PIXI.${oldthing} has been deprecated, please use PIXI.${newthing}"
      }
    };
    this.typeDetection.registerTypes("PIXI.", instance.PIXI, 2);
    instance.Phaser &&
      this.typeDetection.registerTypes("Phaser.", instance.Phaser);
    window.console = console;

    // Register "plugins"
    this.gui = new Gui(this);
    this.outliner = new Outliner(this);
    this.properties = new Properties(this);
    this.highlight = new Highlight(this);
  }

  enable() {
    if (!this.unpatched.CanvasRenderer) {
      this.patch("CanvasRenderer");
    }
    if (!this.unpatched.WebGLRenderer) {
      this.patch("WebGLRenderer");
    }
    // Support for pixi v5
    if (!this.unpatched.Renderer) {
      this.patch("Renderer");
    }
    this.enabled$.next(true);
  }

  disable() {
    for (const [renderer, renderMethod] of Object.entries(this.unpatched)) {
      this.instance.PIXI[renderer].prototype.render = renderMethod;
    }
    this.unpatched = {};
    this.enabled$.next(false);
  }

  /**
   * Path the Renderer.render method to get a hold of the stage object(s)
   */
  patch(renderer) {
    if (this.unpatched[renderer]) {
      /* eslint-disable no-console */
      console.warn(renderer + " already patched");
      /* eslint-enable */
      return;
    }
    const Renderer = this.instance.PIXI[renderer];
    if (Renderer && Renderer.prototype.render) {
      const renderMethod = Renderer.prototype.render;
      this.unpatched[renderer] = renderMethod;
      const self = this;
      Renderer.prototype.render = function(container, ...args) {
        runHooks(self.hooks.beforeRender, container, this);
        const result = renderMethod.apply(this, [container, ...args]);
        runHooks(self.hooks.afterRender, container, this);
        return result;
      };
    }
  }

  /**
   * @param {string} type 'beforeRender', 'afterRender'
   * @param {Function} callback
   * @param {number} ms
   * @return {Function} unregister
   */
  registerHook(type, callback, ms = 0) {
    const hook = {
      callback,
      throttle: ms,
      skip: false
    };
    this.hooks[type].push(hook);
    return () => {
      const index = this.hooks[type].indexOf(hook);
      if (index !== -1) {
        this.hooks[type].splice(index, 1);
      }
    };
  }
}
