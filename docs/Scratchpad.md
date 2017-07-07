
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

Complications:
- Initial communication must flow through the background_script
- The background_script can't initiate a connection
- connections come and go
- response messages dont specify a recipient, which can lead to duplicate and out sync messages.

Simplified flow:

3 message types

1: Broadcasts

{ broadcast: 'DETECT', tabId: 123, data?: * }

Sent by pixi.devtools or a pixi.panel to the background_script which convert the message to a command and send it to all content-connections with the specified tabId.

2. Commands

{ command: 'DETECT', from: 123, to?, id?: 4, data?: * }

When a command is received the script does something and send zero or more Response messages back.
A command is augmented by the background_script with the connection-id of the sender (from field)
(Only the background_script can only relay command when a to: field is given.)


3. Response

{ response: 'DETECTED', to: 123, from: 456, id?: 4, data: { path: 'PIXI', version: 'v4.4' }}

The response is send back to the background_script but with the connection id in the to field and the operation id


