/* global crypto */
const debug = false

const guid = crypto.getRandomValues(new Uint32Array(4)).join('-')
let isDetected = false

function detect (recipient = {}) {
  /* global __PIXI_INSPECTOR_GLOBAL_HOOK__ RECIPIENT */
  executeInContext(function (window) {
    __PIXI_INSPECTOR_GLOBAL_HOOK__.detect(window, RECIPIENT)
  }.toString(), {
    RECIPIENT: recipient
  })
}
/**
 * Execute the javascript inside the context of the page.
 * @param {String} code
 */
function executeInContext (code, variables = {}) {
  for (const constant in variables) {
    const value = JSON.stringify(variables[constant])
    code = code.replace(new RegExp(constant, 'g'), value)
  }
  const script = document.createElement('script')
  script.textContent = ';(' + code + ')(window)'
  document.documentElement.appendChild(script)
  script.parentNode.removeChild(script)
}

(function () {
  /* global DEBUG, GUID */
  function injectedScript (window) {
    const guid = GUID
    window.__PIXI_INSPECTOR_GLOBAL_HOOK__ = {
      _instances: [],
      register (instance, recipient = {}) {
        const i = this._instances.push(instance)
        this.respond('DETECTED', Object.assign({
          to: 0,
          data: {
            index: i,
            version: instance.PIXI.VERSION,
            phaser: instance.Phaser ? instance.Phaser.VERSION : null
          }
        }, recipient))
      },
      respond (response, message) {
        message.response = response
        message.__PIXI_INSPECTOR__ = guid
        window.postMessage(message, '*')
      },

      detect (globals, recipient) {
        if (globals.Phaser && globals.Phaser.PIXI) { // inside Phaser
          this.register({ PIXI: globals.Phaser.PIXI, Phaser: globals.Phaser }, recipient)
        } else if (globals.game && globals.game.PIXI) { // inside panda.js
          this.register({ PIXI: globals.game.PIXI }, recipient)
        } else if (globals.PIXI) { // global variable
          this.register({ PIXI: globals.PIXI }, recipient)
        } else {
          for (let i = 0; i < globals.frames.length; i++) {
            try {
              this.detect(globals.frames[i], recipient)
            } catch (err) {
              if (err.code === 18 && err.name === 'SecurityError') { // DOMException: Blocked a frame with origin "..." from accessing a cross-origin frame.
                return
              }
              if (DEBUG) {
                console.warn(err)
              }
            }
          }
        }
      }
    }
  }

  const code = injectedScript.toString()
  executeInContext(code, {
    GUID: guid,
    DEBUG: debug
  })
})()

const port = chrome.runtime.connect({ name: 'content_scripts' })
port.onMessage.addListener(function (message) {
  debug && console.log('port.onMessage', message)
  if (message.command === 'DETECT') {
    detect({ to: message.from, id: message.id })
  }
})

window.onmessage = function (event) {
  debug && console.log('window.onmessage', event)
  if (typeof event.data === 'object' && event.data.__PIXI_INSPECTOR__ === guid) {
    delete event.data.__PIXI_INSPECTOR__
    debug && console.log('port.postMessage', event.data)
    port.postMessage(event.data)
    isDetected = true
  }
}

port.onDisconnect.addListener(function () {
  debug && console.log('onDisconnect')
  // Extension was restarted
  window.onmessage = null
})
window.onload = function () {
  detect()
  setTimeout(() => {
    if (!isDetected) {
      detect()
    }
  }, 1000)
}
