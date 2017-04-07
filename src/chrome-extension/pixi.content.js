/*global chrome, postMessage */

const hook = function () {
  function detect (globals, path) {
    if (globals.PIXI) { // global variable
      postMessage({ __PIXI_INSPECTOR__: true, path: path + 'PIXI', version: globals.PIXI.VERSION }, '*')
    } else if (globals.game && globals.game.PIXI) { // inside panda.js
      postMessage({ __PIXI_INSPECTOR__: true, path: path + 'game.PIXI', version: globals.game.PIXI.VERSION }, '*')
    } else if (globals.Phaser && globals.Phaser.PIXI) { // inside Phaser
      postMessage({ __PIXI_INSPECTOR__: true, path: path + 'Phaser.PIXI', version: globals.Phaser.PIXI.VERSION }, '*')
    } else {
      for (let i = 0; i < globals.frames.length; i++) {
        try {
          // globals.frames[i].PIXI
          const frameWindow = globals.frames[i]
          detect(frameWindow, path + 'frames[' + i + '].')
        } catch (e) {
          console.warn(e)
        }
      }
    }
  }
  detect(window, 'window.')
}.toString()

chrome.runtime.onConnect.addListener(function () {
  console.log('onConnect', arguments)
})

const port = chrome.runtime.connect({ name: 'content_script' })
let isConnected = true
port.onMessage.addListener(function () {
  console.log('onMessage', arguments)
})
port.onDisconnect.addListener(function () {
    // Extension was restarted
  isConnected = false
})

window.onmessage = function (event) {
  if (typeof event.data === 'object' && event.data.__PIXI_INSPECTOR__) {
    if (isConnected) {
      delete event.data.__PIXI_INSPECTOR__
      port.postMessage(event.data)
    }
  }
}

function detectPixi () {
  const script = document.createElement('script')
  script.textContent = ';(' + hook + ')(window)'
  document.documentElement.appendChild(script)
  script.parentNode.removeChild(script)
}

detectPixi()
// Detect <canvas> with MutationObserver?
setTimeout(detectPixi, 1000)
setTimeout(detectPixi, 5000)
