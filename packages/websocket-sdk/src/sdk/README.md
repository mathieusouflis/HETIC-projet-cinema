# Cinema WebSocket API

## Overview

Real-time WebSocket API for cinema application

- **Version:** 1.0.0
- **Server URL:** wss://localhost:3000 || "localhost:3000"}


## Usage

```javascript
const CinemaWebSocketAPI = require('./client');
const wsClient = new CinemaWebSocketAPI();

async function main() {
  try {
    await wsClient.connect();
    // use wsClient to send/receive messages
    await wsClient.close();
  } catch (error) {
    console.error('Failed to connect:', error);
  }
}

main();
```


## API

### `connect()`
Establishes a WebSocket connection.

### `registerMessageHandler(handlerFunction)`
Registers a callback for incoming messages.

### `registerErrorHandler(handlerFunction)`
Registers a callback for connection errors.

### `close()`
Closes the WebSocket connection.


### Available Operations

#### `receive_chat_join(payload)`
Join a chat room



#### `receive_chat_leave(payload)`
Leave a chat room



#### `receive_chat_message(payload)`
Send a message to a chat room



#### `receive_chat_typing(payload)`
Notify others that user is typing



#### `send_chat_new_message(payload)`
New message received in chat room



#### `send_chat_user_joined(payload)`
User joined the chat room



#### `send_chat_user_left(payload)`
User left the chat room



#### `send_chat_user_typing(payload)`
User is typing indicator



