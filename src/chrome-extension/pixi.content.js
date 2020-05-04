/* eslint-disable no-console */
/* global __PIXI_INSPECTOR_GLOBAL_HOOK__ */

const debug = false;

const uid = crypto.getRandomValues(new Uint16Array(3)).join("-");
let isDetected = false;
if (debug) {
  console.info("pixi.content", uid);
}

const globalHook = {
  /* global RECIPIENT */
  reportDetection(recipient = {}) {
    this.executeInContext(
      function () {
        __PIXI_INSPECTOR_GLOBAL_HOOK__.reportDetection(window, RECIPIENT);
      }.toString(),
      {
        RECIPIENT: recipient,
      }
    );
  },
  reportInstances(recipient) {
    this.executeInContext(
      function () {
        __PIXI_INSPECTOR_GLOBAL_HOOK__.reportInstances(RECIPIENT);
      }.toString(),
      {
        RECIPIENT: recipient,
      }
    );
  },
  reportInspector(index, recipient) {
    /* global INDEX */
    this.executeInContext(
      function () {
        __PIXI_INSPECTOR_GLOBAL_HOOK__.reportInspector(INDEX, RECIPIENT);
      }.toString(),
      {
        INDEX: index,
        RECIPIENT: recipient,
      }
    );
  },
  disable() {
    this.executeInContext(
      function () {
        __PIXI_INSPECTOR_GLOBAL_HOOK__.disable();
      }.toString()
    );
  },

  /**
   * Execute the javascript inside the context of the page.
   * @param {String} code
   */
  executeInContext(code, variables = {}) {
    for (const constant in variables) {
      const value = JSON.stringify(variables[constant]);
      code = code.replace(new RegExp(constant, "g"), value);
    }
    const script = document.createElement("script");
    script.textContent = ";(" + code + ")(window)";
    document.documentElement.appendChild(script);
    script.parentNode.removeChild(script);
  },
};

(function () {
  /* global UID, DEBUG, INSPECTOR_SCRIPT_URL */
  function injectedScript(window) {
    // Private
    const uid = UID;
    const debug = DEBUG;
    function respond(response, data, recipient) {
      debug && console.log("respond", { response, data, recipient });
      window.postMessage(
        Object.assign(
          {
            response,
            data,
            _pixiInspector: uid,
          },
          recipient
        ),
        "*"
      );
    }

    function broadcast(command, recipient, data) {
      debug && console.log("broadcast", { command, recipient, data });
      window.postMessage(
        {
          broadcast: command,
          filter: recipient,
          data,
          _pixiInspector: uid,
        },
        "*"
      );
    }

    let pixiPanelId = -1;
    function emit(command, data) {
      debug && console.log("emit", { command, data });
      window.postMessage(
        {
          command,
          to: pixiPanelId,
          data,
          _pixiInspector: uid,
        },
        "*"
      );
    }
    const _instances = [];
    let InspectorPromise = false;
    // Public
    window.__PIXI_INSPECTOR_GLOBAL_HOOK__ = {
      inspectors: [],
      register(instance) {
        const exists = _instances.find(
          (existing) => existing.PIXI === instance.PIXI
        );
        if (exists) {
          if (instance.Phaser) {
            exists.Phaser = instance.Phaser;
          }
          return;
        }
        const i = _instances.push(Object.assign({ status: "IDLE" }, instance));
        broadcast(
          "DETECTED",
          { channel: "devtools_page" },
          {
            index: i - 1,
            version: instance.PIXI.VERSION,
            phaser: instance.Phaser ? instance.Phaser.VERSION : false,
          }
        );
      },

      reportInstances(recipient) {
        this.reportDetection(window, recipient);
        const data = _instances.map((instance) => ({
          version: instance.PIXI.VERSION,
          status: instance.status,
        }));
        respond("INSTANCES", data, recipient);
      },

      reportDetection(globals, recipient) {
        if (globals.Phaser && globals.Phaser.PIXI) {
          // inside Phaser
          this.register(
            { PIXI: globals.Phaser.PIXI, Phaser: globals.Phaser },
            recipient
          );
        } else if (globals.game && globals.game.PIXI) {
          // inside panda.js
          this.register({ PIXI: globals.game.PIXI }, recipient);
        } else if (globals.PIXI) {
          // global variable
          this.register({ PIXI: globals.PIXI }, recipient);
        } else {
          for (let i = 0; i < globals.frames.length; i++) {
            try {
              this.reportDetection(globals.frames[i], recipient);
            } catch (err) {
              if (err.code === 18 && err.name === "SecurityError") {
                // DOMException: Blocked a frame with origin "..." from accessing a cross-origin frame.
                return;
              }
              if (debug) {
                console.warn(err);
              }
            }
          }
        }
      },

      reportInspector(index, recipient) {
        if (!_instances[index]) {
          respond("ERROR", "OUT_OF_BOUNDS", recipient);
          return;
        }
        pixiPanelId = recipient.to;
        if (_instances[index].status !== "IDLE") {
          respond("INSPECTOR", _instances[index].inspector, recipient);
          return;
        }
        _instances[index].status = "LOADING";
        this.injectInspector()
          .then((Inspector) => {
            this.inspectors.push(new Inspector(_instances[index], emit));
            _instances[index].inspector = this.inspectors.length - 1;
            _instances[index].status = "INJECTED";
            respond("INSPECTOR", _instances[index].inspector, recipient);
          })
          .catch((error) => {
            respond("ERROR", error.message, recipient);
          });
      },
      /**
       * @returns {Promise}
       */
      injectInspector() {
        if (InspectorPromise) {
          return InspectorPromise;
        }
        InspectorPromise = new Promise((resolve) => {
          const script = window.document.createElement("script");
          script.src = INSPECTOR_SCRIPT_URL;
          const html = document.getElementsByTagName("html")[0];
          script.onload = () => {
            resolve(this.Inspector);
          };
          html.appendChild(script);
        });
        return InspectorPromise;
      },

      disable() {
        for (const inspector of this.inspectors) {
          inspector.disable();
        }
      },
    };
  }

  const code = injectedScript.toString();
  globalHook.executeInContext(code, {
    UID: uid,
    DEBUG: debug,
    INSPECTOR_SCRIPT_URL: chrome.extension.getURL("pixi.inspector.bundle.js"),
  });
})();

const port = chrome.runtime.connect({ name: "content_scripts" });
port.onMessage.addListener((message) => {
  debug && console.log("port.onMessage", message);
  switch (message.command) {
    case "DETECT":
      globalHook.reportDetection({ to: message.from, id: message.id });
      break;
    case "INSTANCES":
      globalHook.reportInstances({ to: message.from, id: message.id });
      break;
    case "INSPECTOR":
      globalHook.reportInspector(message.data, {
        to: message.from,
        id: message.id,
      });
      break;
    case "DISCONNECTED":
      globalHook.disable();
      break;
  }
});

window.onmessage = function (event) {
  debug && console.log("window.onmessage", event);
  if (typeof event.data === "object" && event.data._pixiInspector === uid) {
    delete event.data._pixiInspector;
    debug && console.log("port.postMessage", event.data);
    port.postMessage(event.data);
    if (event.data.response === "DETECTED") {
      isDetected = true;
    }
  }
};

port.onDisconnect.addListener(() => {
  debug && console.log("onDisconnect");
  // Extension was restarted
  window.onmessage = null;
});
window.onload = function () {
  globalHook.reportDetection();
  setTimeout(() => {
    if (!isDetected) {
      globalHook.reportDetection();
    }
  }, 1000);
};
