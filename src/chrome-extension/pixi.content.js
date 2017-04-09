const hook = function () {
  function detect (globals, path) {
    let detected = false
    if (globals.Phaser && globals.Phaser.PIXI) { // inside Phaser
      detected = { path: path + 'Phaser.PIXI', version: globals.Phaser.PIXI.VERSION }
    } else if (globals.game && globals.game.PIXI) { // inside panda.js
      detected = { path: path + 'game.PIXI', version: globals.game.PIXI.VERSION }
    } else if (globals.PIXI) { // global variable
      detected = { path: path + 'PIXI', version: globals.PIXI.VERSION }
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
          console.warn(err)
        }
      }
    }
    if (detected) {
      detected.__PIXI_INSPECTOR__ = true
      detected.command = 'DETECTED'
      window.postMessage(detected, '*')
    }
  }
  detect(window, 'window.')
}.toString()

chrome.runtime.onConnect.addListener(function () {
  console.log('onConnect', arguments)
})

const port = chrome.runtime.connect({ name: 'content_scripts' })
let isConnected = true
port.onMessage.addListener(function (message) {
  if (message.command === 'RETRY') {
    detectPixi()
  } else {
    console.log('onMessage', arguments)
  }
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
      console.log('postMessage', event.data)
      clearTimeout(timeout1sec)
      timeout1sec = null
      clearTimeout(timeout5sec)
      timeout5sec = null
    }
  }
}

function detectPixi () {
  const script = document.createElement('script')
  script.textContent = ';(' + hook + ')(window)'
  document.documentElement.appendChild(script)
  script.parentNode.removeChild(script)
}

// Detect <canvas> with MutationObserver?
var timeout1sec = setTimeout(detectPixi, 1000)
var timeout5sec = setTimeout(detectPixi, 5000)
detectPixi()
