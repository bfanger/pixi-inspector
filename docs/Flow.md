
# Flow

## A. In every page and isolated iframe

A1) The extensions injects a small content_script into the page/iframe before anything is loaded.
A2) Because the content_script is isolated it injects a small script into the page.
A3) That script creates a `__PIXI_INSPECTOR_GLOBAL_HOOK__` on the window object which is accessable by normal javascript.
A4) (optional) You can manually register PIXI. Phaser example: `'__PIXI_INSPECTOR_GLOBAL_HOOK__' in window && __PIXI_INSPECTOR_GLOBAL_HOOK__.register({ PIXI: Phaser.PIXI, Phaser: Phaser })`
A5) Then the window.onload fires, the page & iframe are scanned to detect PIXI.
A6) (optional) If PIXI was not found, it will scan again after 1 second.
A7) If PIXI was detected it will broadcast a DETECTED message.

All code in this fase is written in performant vanilla javascript as it affects every page.

## B. Google Chrome toolbar
B1. When the extension receives a DETECTED message the [pageAction](https://developer.chrome.com/extensions/pageAction) is shown with the detected version.

## C. Chrome DevTools
C1. When the devtools are opened. we'll scan for PIXI again and ask how many PIXI's where detected in the page.
C2. When 1 or more PIXI are detected a new tab "Pixi" will become available in the devtools.

# D. Pixi panel
