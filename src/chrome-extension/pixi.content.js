/* global __RESPONSE__ */

const debug = true

// @todo AutoDetect based on new <canvas>es using MutationObserver instead of polling?
debug && console.info('pixi.content')
/**
 * PIXI detection code
 */
const hook = function () {
  function detect (globals, path) {
    const response = __RESPONSE__
    if (globals.Phaser && globals.Phaser.PIXI) { // inside Phaser
      response.data = { path: path + 'Phaser.PIXI', version: globals.Phaser.PIXI.VERSION }
    } else if (globals.game && globals.game.PIXI) { // inside panda.js
      response.data = { path: path + 'game.PIXI', version: globals.game.PIXI.VERSION }
    } else if (globals.PIXI) { // global variable
      response.data = { path: path + 'PIXI', version: globals.PIXI.VERSION }
    } else {
      for (let i = 0; i < globals.frames.length; i++) {
        try {
          // globals.frames[i].PIXI
          const frameWindow = globals.frames[i]
          detect(frameWindow, path + 'frames[' + i + '].')
        } catch (err) {
          if (err.code === 18 && err.name === 'SecurityError') { // DOMException: Blocked a frame with origin "..." from accessing a cross-origin frame.
            return
          }
          // console.warn(err)
        }
      }
    }
    if (response.data) {
      window.postMessage(response, '*')
    }
  }
  detect(window, 'window.')
}.toString()

/**
 * Execute the javascript inside the context of the page.
 * @param {String} code
 */
function executeInContext (code) {
  const script = document.createElement('script')
  script.textContent = ';(' + code + ')(window)'
  document.documentElement.appendChild(script)
  script.parentNode.removeChild(script)
}

const port = chrome.runtime.connect({ name: 'content_scripts' })
port.onMessage.addListener(function (message) {
  debug && console.log('port.onMessage', message)
  if (message.command === 'DETECT') {
    const response = { response: 'DETECTED', to: message.from, id: message.id, __PIXI_INSPECTOR__: true }
    executeInContext(hook.replace('__RESPONSE__', JSON.stringify(response)))
  }
})

window.onmessage = function (event) {
  debug && console.log('window.onmessage', event)
  if (typeof event.data === 'object' && event.data.__PIXI_INSPECTOR__) {
    delete event.data.__PIXI_INSPECTOR__
    debug && console.log('port.postMessage', event.data)
    port.postMessage(event.data)
  }
}

port.onDisconnect.addListener(function () {
  debug && console.log('onDisconnect')
    // Extension was restarted
  window.onmessage = null
})
