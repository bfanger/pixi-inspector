/*global  chrome */
import './common'
import port$ from './devtools-rx/port$'
/**
 * Access to the chrome.devtools apis
 */
console.info('pixi.devtools')

chrome.devtools.panels.create('Pixi', 'img/pixi.png', 'pixi.panel.html', function (panel) {
	// listen to panel hide / show events?
})
// Detect pixi and colorize icon?
port$.subscribe(port => {
  console.log(port)
})
