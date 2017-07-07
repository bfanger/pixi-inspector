
https://phaser.io/examples/v2/animation/change-frame

https://developer.chrome.com/extensions/background_pages

https://developer.chrome.com/extensions/event_pages

https://developer.chrome.com/extensions/devtools


Listen to disconnect signals in panel.

Listen to new contentScript connections.

Managing state

- background_script connection
- proxy connection


Rx (Panel)

Communication with background_script
(setup communication with pixi.inspector)

 connected$ >--o--------------o
               \
               Connection c
                \
                 c.message$ >-o---o--o


proxy$ >--------o------
       \false    \




Its hard too reason about the message streams...

