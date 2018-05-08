import { Observable } from "rxjs/Observable";
import { Subject } from "rxjs/Subject";
import { ReplaySubject } from "rxjs/ReplaySubject";

export const overlay = {
  div: null,
  renderer: null,
  PIXI: null,
  Stage: null
};

export default class InspectorGui {
  constructor(inspector) {
    if (!overlay.PIXI) {
      this.initOverlay(inspector);
    }
    this.stage = new overlay.Stage();
    if (
      overlay.Stage !==
      (overlay.PIXI.Container || overlay.PIXI.DisplayObjectContainer)
    ) {
      this.container = new overlay.PIXI.DisplayObjectContainer();
      this.stage.addChild(this.container);
    } else {
      this.container = this.stage;
    }
    this.offset = {
      canvas: { x: 0, y: 0 },
      iframe: { x: 0, y: 0 }
    };
    this.size = {
      canvas: { width: 800, y: 600 },
      renderer: { width: 800, y: 600 }
    };

    inspector.registerHook(
      "beforeRender",
      this.updateRenderer.bind(this),
      5000
    );
    inspector.registerHook("beforeRender", this.render.bind(this));
    this.rightclick$ = new Subject();
    this.renderer$ = new ReplaySubject(1);

    const canvas$ = this.renderer$
      .map(renderer => renderer.view)
      .distinctUntilChanged();

    const iframe$ = canvas$
      .map(reference => {
        for (const canvas of document.querySelectorAll("canvas")) {
          if (canvas === reference) {
            return null; // canvas found in current frame
          }
        }
        for (const iframe of document.querySelectorAll("iframe")) {
          try {
            for (const canvas of iframe.contentDocument.querySelectorAll(
              "canvas"
            )) {
              if (canvas === reference) {
                return iframe;
              }
            }
          } catch (err) {
            // ignore cors errors
          }
        }
        return null;
      })
      .shareReplay(1);

    const handleClick$ = canvas$.switchMap(canvas =>
      Observable.merge(
        Observable.fromEvent(canvas, "contextmenu").do(event => {
          event.preventDefault();
        }),
        Observable.fromEvent(canvas, "pointerdown", { capture: true })
          .withLatestFrom(iframe$, this.renderer$)
          .do(([event, iframe, renderer]) => {
            const mobSelectKey = event.pointerType === "touch" && event.altKey;
            if (event.which === 3 || mobSelectKey) {
              this.calculateOffset(canvas, iframe);
              const scale = {
                x: this.resolution.x / renderer.resolution,
                y: this.resolution.y / renderer.resolution
              };
              const x = (event.clientX - this.offset.canvas.x) * scale.x;
              const y = (event.clientY - this.offset.canvas.y) * scale.y;
              this.rightclick$.next({ x, y, event });
            }
          })
      )
    );

    const handleResize$ = Observable.fromEvent(window, "resize")
      .debounceTime(100)
      .do(() => {
        overlay.renderer.resize(window.innerWidth, window.innerHeight);
        overlay.renderer.view.style.width = window.innerWidth + "px";
        overlay.renderer.view.style.height = window.innerHeight + "px";
      })
      .switchMap(() =>
        iframe$.combineLatest(canvas$).do(([iframe, canvas]) => {
          this.calculateOffset(canvas, iframe);
        })
      );

    const handleScroll$ = iframe$
      .combineLatest(canvas$)
      .switchMap(([iframe, canvas]) => {
        const elements = [window]
          .concat(parentElements(iframe))
          .concat(parentElements(canvas));
        if (iframe) {
          elements.push(iframe.contentWindow);
        }
        return Observable.merge(
          ...elements.map(element => Observable.fromEvent(element, "scroll"))
        )
          .debounceTime(50)
          .do(() => {
            this.calculateOffset(canvas, iframe);
          });
      });

    this.subscription = inspector.enabled$
      .do(enabled => {
        if (enabled) {
          overlay.div.removeAttribute("style");
        } else {
          overlay.div.removeAttribute("style");
        }
      })
      .switchMap(enabled => {
        if (enabled === false) {
          return Observable.empty();
        }
        return Observable.merge(
          handleResize$,
          handleScroll$,
          handleClick$,
          canvas$.combineLatest(iframe$).do(([canvas, iframe]) => {
            this.calculateOffset(canvas, iframe);
          })
        );
      })
      .subscribe();
  }

  get resolution() {
    return {
      x: this.size.renderer.width / this.size.canvas.width,
      y: this.size.renderer.height / this.size.canvas.height
    };
  }

  /*eslint-disable class-methods-use-this */
  initOverlay(inspector) {
    overlay.PIXI = inspector.instance.PIXI;
    overlay.Stage =
      overlay.PIXI.Container ||
      overlay.PIXI.Stage ||
      overlay.PIXI.DisplayObjectContainer;
    overlay.div = document.createElement("div");
    overlay.div.id = "pixi-inspector-overlay";
    const style = document.createElement("style");
    style.textContent = `
      #pixi-inspector-overlay {
        position: fixed;
        z-index: 16000000;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        pointer-events: none;
        overflow: hidden;
      }
      #pixi-inspector-overlay canvas {
        position: absolute;
        top: 0;
        left: 0;
      }
      `;
    overlay.div.appendChild(style);
    document.body.appendChild(overlay.div);

    const canvas = document.createElement("canvas");
    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";

    const options = {
      transparent: true,
      resolution: window.devicePixelRatio,
      view: canvas
    };
    if (overlay.PIXI.WebGLRenderer.length === 1) {
      // Expects a Phaser Game object?
      overlay.renderer = new overlay.PIXI.WebGLRenderer(
        Object.assign(
          {
            canvas,
            camera: {
              _shake: { x: 0, y: 0 }
            },
            width: window.innerWidth,
            height: window.innerHeight
          },
          options
        )
      );
    } else {
      overlay.renderer = new overlay.PIXI.WebGLRenderer(
        window.innerWidth,
        window.innerHeight,
        options
      );
    }
    overlay.div.appendChild(canvas);
  }

  render() {
    if (overlay.renderer) {
      overlay.renderer.render(this.stage);
    }
  }

  updateRenderer(_, renderer) {
    this.renderer = renderer;
    this.renderer$.next(renderer);
  }

  calculateOffset(canvas, iframe) {
    const bounds = canvas.getBoundingClientRect();
    this.offset.canvas.x = bounds.left;
    this.offset.canvas.y = bounds.top;
    this.size.canvas.width = bounds.width;
    this.size.canvas.height = bounds.height;
    this.size.renderer.width = this.renderer.width;
    this.size.renderer.height = this.renderer.height;

    if (iframe) {
      const iframeBounds = iframe.getBoundingClientRect();
      this.offset.iframe.x = iframeBounds.left;
      this.offset.iframe.y = iframeBounds.top;
    } else {
      this.offset.iframe.x = 0;
      this.offset.iframe.y = 0;
    }
    this.container.position.x = this.offset.iframe.x + this.offset.canvas.x;
    this.container.position.y = this.offset.iframe.y + this.offset.canvas.y;
  }
}

function parentElements(element) {
  if (element === null) {
    return [];
  }
  const elements = [];
  while (element.parentElement) {
    elements.push(element.parentElement);
    element = element.parentElement;
  }
  return elements;
}
