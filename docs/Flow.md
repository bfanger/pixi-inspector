
# Flow

1. The extensions injects a small content_script into the page/iframe before anything is loaded.
2. Because the content_script is isolated it injects a small script into the page.
3. That script creates a `__PIXI_INSPECTOR_GLOBAL_HOOK__` on the window object which is accessable by normal javascript.
4. Then the window.onload fires, the page & iframe are scanned to detect PIXI.
5. You can also manually register PIXI. Phaser example: `'__PIXI_INSPECTOR_GLOBAL_HOOK__' in window && __PIXI_INSPECTOR_GLOBAL_HOOK__.register({ PIXI: Phaser.PIXI, Phaser: Phaser })`

