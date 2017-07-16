RxJS wrappers for Chrome Extension API's

https://developer.chrome.com/extensions/api_index

# Inter Process Communication

The Chrome Extension is split across diffent processes, each process has different capabilities.
Security complicates things even more, as Chrome won't expose the processes and doesn't allow direct communication between all processes.

To simplify IPC i've codified common communcation patterns into the devtools-rx library.

## Message types

### Broadcast

```js
{ broadcast: 'DETECT', filter: {name: 'content_scripts', tabId: 123}, data?: * }
```

Sent by pixi.devtools or pixi.panel to the background_script which converts the message to a command and send it to all connections that match the filter.

### Command

```js
{ command: 'DETECT', from: 123, to?, id?: 4, data?: * }
```

When a command is received the script does something and send zero or more Response messages back.
A command is augmented by the background_script with the connection-id of the sender (from field)
(Only the background_script can only relay command when a to: field is given.)

### Response

```js
{ response: 'DETECTED', to: 123, from: 456, id?: 4, data?: { path: 'PIXI', version: 'v4.4' }}
```

The response is send back to the background_script but with the connection id in the to field and the operation id

## API Example

##  In the background page:

```
relay$.subscribe()
```
- Sets up listeners so other processen can connect
- Handles messages and relays them to the specified targets.

### In other (extension) processes:

```js
const connection = new Connection('workers')
connection.on('WORK').subscribe(message => {
    ...
    message.respond('WORK_COMPLETED', result)
})
```

- Open a connection and idenfies itself as "workers".
- Starts listening for the 'WORK' command.
- Send a 'WORK_COMPLETED' response

### In yet another (extension) process:

```js
const connection = new Connection('directors')
connection.to('workers').stream('WORK', { do:'stuff' }).subscribe(message => {
    // worker X has completed work
    conn.to(message.from).send('THANKS', { well: 'done' })
})
```

- Open a connection with a differrent name ('directors').
- Send a broadcast message to all connections with the 'workers' name.
- Listen to the responses from the 'WORK' command
- Send the 'THANKS' command to the connection that responded.
