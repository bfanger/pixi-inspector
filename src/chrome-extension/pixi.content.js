/* global crypto, location */
const debug = false

const uid = crypto.getRandomValues(new Uint16Array(3)).join('-')
let isDetected = false
if (debug) {
  console.info('pixi.content', uid)
}

const proxy = {
  reportDetection (recipient = {}) {
    /* global __PIXI_INSPECTOR_GLOBAL_HOOK__ RECIPIENT */
    this.executeInContext(function (window) {
      __PIXI_INSPECTOR_GLOBAL_HOOK__.reportDetection(window, RECIPIENT)
    }.toString(), {
      RECIPIENT: recipient
    })
  },
  reportInstances (recipient) {
    /* global __PIXI_INSPECTOR_GLOBAL_HOOK__ RECIPIENT */
    this.executeInContext(function (window) {
      __PIXI_INSPECTOR_GLOBAL_HOOK__.reportInstances(RECIPIENT)
    }.toString(), {
      RECIPIENT: recipient
    })
  },

  /**
   * Execute the javascript inside the context of the page.
   * @param {String} code
   */
  executeInContext (code, variables = {}) {
    for (const constant in variables) {
      const value = JSON.stringify(variables[constant])
      code = code.replace(new RegExp(constant, 'g'), value)
    }
    const script = document.createElement('script')
    script.textContent = ';(' + code + ')(window)'
    document.documentElement.appendChild(script)
    script.parentNode.removeChild(script)
  }
}

!(function () {
  /* global DEBUG, UID */
  function injectedScript (window) {
    // Private
    const uid = UID
    const debug = DEBUG
    function respond (response, data, recipient) {
      debug && console.log('respond', { response, data, recipient })
      window.postMessage(Object.assign({
        response: response,
        data: data,
        _pixiInspector: uid
      }, recipient), '*')
    }

    function broadcast (command, recipient, data) {
      debug && console.log('broadcast', { command, recipient, data })
      window.postMessage({
        broadcast: command,
        filter: recipient,
        data: data,
        _pixiInspector: uid
      }, '*')
    }
    const _instances = []
    // Public
    window.__PIXI_INSPECTOR_GLOBAL_HOOK__ = {
      register (instance, recipient = {}) {
        const exists = _instances.find(existing => existing.PIXI === instance.PIXI)
        if (exists) {
          if (instance.Phaser) {
            exists.Phaser = instance.Phaser
          }
          return
        }
        const i = _instances.push(Object.assign({ status: 'FRESH' }, instance))
        broadcast('DETECTED', { channel: 'devtools_page' }, {
          index: i - 1,
          version: instance.PIXI.VERSION,
          phaser: instance.Phaser ? instance.Phaser.VERSION : false
        })
      },

      reportInstances (recipient) {
        this.reportDetection(window, recipient)
        const data = _instances.map(instance => ({
          version: instance.PIXI.VERSION,
          status: instance.status
        }))
        respond('INSTANCES', data, recipient)
      },

      reportDetection (globals, recipient) {
        if (globals.Phaser && globals.Phaser.PIXI) { // inside Phaser
          this.register({ PIXI: globals.Phaser.PIXI, Phaser: globals.Phaser }, recipient)
        } else if (globals.game && globals.game.PIXI) { // inside panda.js
          this.register({ PIXI: globals.game.PIXI }, recipient)
        } else if (globals.PIXI) { // global variable
          this.register({ PIXI: globals.PIXI }, recipient)
        } else {
          for (let i = 0; i < globals.frames.length; i++) {
            try {
              this.reportDetection(globals.frames[i], recipient)
            } catch (err) {
              if (err.code === 18 && err.name === 'SecurityError') { // DOMException: Blocked a frame with origin "..." from accessing a cross-origin frame.
                return
              }
              if (debug) {
                console.warn(err)
              }
            }
          }
        }
      }
    }
  }

  const code = injectedScript.toString()
  proxy.executeInContext(code, {
    UID: uid,
    DEBUG: debug
  })
})()

const port = chrome.runtime.connect({ name: 'content_scripts' })
port.onMessage.addListener(function (message) {
  debug && console.log('port.onMessage', message)
  switch (message.command) {
    case 'DETECT':
      proxy.reportDetection({ to: message.from, id: message.id })
      break
    case 'INSTANCES':
      proxy.reportInstances({ to: message.from, id: message.id })
      break
  }
})

window.onmessage = function (event) {
  debug && console.log('window.onmessage', event)
  if (typeof event.data === 'object' && event.data._pixiInspector === uid) {
    delete event.data._pixiInspector
    debug && console.log('port.postMessage', event.data)
    port.postMessage(event.data)
    if (event.data.response === 'DETECTED') {
      isDetected = true
    }
  }
}

port.onDisconnect.addListener(function () {
  debug && console.log('onDisconnect')
  // Extension was restarted
  window.onmessage = null
})
window.onload = function () {
  proxy.reportDetection()
  setTimeout(() => {
    if (!isDetected) {
      proxy.reportDetection()
    }
  }, 1000)
}
