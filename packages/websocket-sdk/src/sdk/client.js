//////////////////////////////////////////////////
//
// Cinema WebSocket API - 1.0.0
// Protocol: wss
// Host: localhost:3000 || "localhost:3000"}
//
//////////////////////////////////////////////////

const WebSocket = require('ws');
const { compileSchemasByOperationId, validateMessage } = require('@asyncapi/keeper');
const path = require('path');
const asyncapiFilepath = path.resolve(__dirname, './asyncapi.yaml');
class CinemaWebSocketAPI {

  /*
    * Constructor to initialize the WebSocket client
    * @param {string} url - The WebSocket server URL. Use it if the server URL is different from the default one taken from the AsyncAPI document.
  */
  constructor(url) {
    this.url = url || 'wss://localhost:3000 || "localhost:3000"}';
    this.websocket = null;
    this.messageHandlers = [];
    this.errorHandlers = [];
    this.compiledSchemas = {};
    this.schemasCompiled = false;
    this.sendOperationsId = ["send_chat_new_message","send_chat_user_joined","send_chat_user_left","send_chat_user_typing"];
  }

  // Method to establish a WebSocket connection
  connect() {
      return new Promise((resolve, reject) => {
          this.websocket = new WebSocket(this.url);
          // On successful connection
        this.websocket.onopen = () => {
        console.log('Connected to Cinema WebSocket API server');
        resolve();
      };

          // On receiving a message
      this.websocket.onmessage = (event) => {
        if (this.messageHandlers.length > 0) {
          // Call custom message handlers
          this.messageHandlers.forEach(handler => {
            if (typeof handler === 'function') {
              this.handleMessage(event.data, handler);
            }
          });
        } else {
          // Default message logging
          console.log('Message received:', event.data);
        }
      };

          // On error first call custom error handlers, then default error behavior
      this.websocket.onerror = (error) => {
        if (this.errorHandlers.length > 0) {
          // Call custom error handlers
          this.errorHandlers.forEach(handler => handler(error));
        } else {
          // Default error behavior
          console.error('WebSocket Error:', error);
        }
        reject(error);
      };

          // On connection close
      this.websocket.onclose = () => {
        console.log('Disconnected from Cinema WebSocket API server');
      };

      });
  }

  // Method to register custom message handlers
   registerMessageHandler(handler) {
    if (typeof handler === 'function') {
      this.messageHandlers.push(handler);
    } else {
      console.warn('Message handler must be a function');
    }
  }

  // Method to register custom error handlers
   registerErrorHandler(handler) {
    if (typeof handler === 'function') {
      this.errorHandlers.push(handler);
    } else {
      console.warn('Error handler must be a function');
    }
  }

  // Method to handle message with callback
   handleMessage(message, cb) {
    if (cb) cb(message);
  }

  /**
   * Initialize and compile all schemas for operations defined.
   * This should be called once after creating the client instance.
   * Subsequent calls will be ignored if schemas are already compiled.
   * 
   * @returns {Promise<void>}
   * @throws {Error} If schema compilation fails for any operation
   */
  async compileOperationSchemas() {
    if (this.schemasCompiled) {
      return;
    }

    try {
      // Compile schemas for all send operations
      for (const operationId of this.sendOperationsId) {
        this.compiledSchemas[operationId] = await compileSchemasByOperationId(asyncapiFilepath, operationId);
      }
      this.schemasCompiled = true;
      console.log('Schemas initialized successfully for operations:', this.sendOperationsId.join(', '));
    } catch (error) {
      console.error('Error initializing schemas:', error);
    }
  }

  /**
   * Sends a send_chat_new_message message over the WebSocket connection.
   * 
   * @param {Object} message - The message payload to send. Should match the schema defined in the AsyncAPI document.
   * @param {WebSocket} socket - The WebSocket connection to use.
   * @param {Array<function>} schemas - Array of compiled schema validator functions for this operation.
   * @throws {TypeError} If message cannot be stringified to JSON
   * @throws {Error} If WebSocket connection is not in OPEN state
   * @throws {Error} If message validation fails against all schemas
   */
  static send_chat_new_message(message, socket, schemas) {
    try {
      if (!schemas || schemas.length === 0) {
        socket.send(JSON.stringify(message));
        return { isValid: true }; 
      }
      const allValidationErrors = [];
      let isValid = false;
      for(const compiledSchema of schemas){
        const validationResult = validateMessage(compiledSchema, message);
        if (validationResult.isValid) {
          isValid = true;
          socket.send(JSON.stringify(message));
          break;
        } else {
          if (validationResult.validationErrors) {
            allValidationErrors.push(...validationResult.validationErrors);
          }
        }
        if (!isValid) {
          console.error('Validation errors:', JSON.stringify(allValidationErrors, null, 2));
        }
      }
    } catch (error) {
      console.error('Error sending send_chat_new_message message:', error);
    }
  }

  /**
   * Instance method version of send_chat_new_message that uses the client's own WebSocket connection.
   * Automatically compiles schemas if not already compiled.
   * 
   * @param {Object} message - The message payload to send
   * @throws {Error} If WebSocket connection is not established
   * @throws {Error} If schema compilation fails
   * @throws {Error} If message validation fails against all schemas
   */
  async send_chat_new_message(message){
    if(!this.websocket){
      throw new Error('WebSocket connection not established. Call connect() first.');
    }
    await this.compileOperationSchemas();
    const schemas = this.compiledSchemas['send_chat_new_message'];
    CinemaWebSocketAPI.send_chat_new_message(message, this.websocket, schemas);
  }

  /**
   * Sends a send_chat_user_joined message over the WebSocket connection.
   * 
   * @param {Object} message - The message payload to send. Should match the schema defined in the AsyncAPI document.
   * @param {WebSocket} socket - The WebSocket connection to use.
   * @param {Array<function>} schemas - Array of compiled schema validator functions for this operation.
   * @throws {TypeError} If message cannot be stringified to JSON
   * @throws {Error} If WebSocket connection is not in OPEN state
   * @throws {Error} If message validation fails against all schemas
   */
  static send_chat_user_joined(message, socket, schemas) {
    try {
      if (!schemas || schemas.length === 0) {
        socket.send(JSON.stringify(message));
        return { isValid: true }; 
      }
      const allValidationErrors = [];
      let isValid = false;
      for(const compiledSchema of schemas){
        const validationResult = validateMessage(compiledSchema, message);
        if (validationResult.isValid) {
          isValid = true;
          socket.send(JSON.stringify(message));
          break;
        } else {
          if (validationResult.validationErrors) {
            allValidationErrors.push(...validationResult.validationErrors);
          }
        }
        if (!isValid) {
          console.error('Validation errors:', JSON.stringify(allValidationErrors, null, 2));
        }
      }
    } catch (error) {
      console.error('Error sending send_chat_user_joined message:', error);
    }
  }

  /**
   * Instance method version of send_chat_user_joined that uses the client's own WebSocket connection.
   * Automatically compiles schemas if not already compiled.
   * 
   * @param {Object} message - The message payload to send
   * @throws {Error} If WebSocket connection is not established
   * @throws {Error} If schema compilation fails
   * @throws {Error} If message validation fails against all schemas
   */
  async send_chat_user_joined(message){
    if(!this.websocket){
      throw new Error('WebSocket connection not established. Call connect() first.');
    }
    await this.compileOperationSchemas();
    const schemas = this.compiledSchemas['send_chat_user_joined'];
    CinemaWebSocketAPI.send_chat_user_joined(message, this.websocket, schemas);
  }

  /**
   * Sends a send_chat_user_left message over the WebSocket connection.
   * 
   * @param {Object} message - The message payload to send. Should match the schema defined in the AsyncAPI document.
   * @param {WebSocket} socket - The WebSocket connection to use.
   * @param {Array<function>} schemas - Array of compiled schema validator functions for this operation.
   * @throws {TypeError} If message cannot be stringified to JSON
   * @throws {Error} If WebSocket connection is not in OPEN state
   * @throws {Error} If message validation fails against all schemas
   */
  static send_chat_user_left(message, socket, schemas) {
    try {
      if (!schemas || schemas.length === 0) {
        socket.send(JSON.stringify(message));
        return { isValid: true }; 
      }
      const allValidationErrors = [];
      let isValid = false;
      for(const compiledSchema of schemas){
        const validationResult = validateMessage(compiledSchema, message);
        if (validationResult.isValid) {
          isValid = true;
          socket.send(JSON.stringify(message));
          break;
        } else {
          if (validationResult.validationErrors) {
            allValidationErrors.push(...validationResult.validationErrors);
          }
        }
        if (!isValid) {
          console.error('Validation errors:', JSON.stringify(allValidationErrors, null, 2));
        }
      }
    } catch (error) {
      console.error('Error sending send_chat_user_left message:', error);
    }
  }

  /**
   * Instance method version of send_chat_user_left that uses the client's own WebSocket connection.
   * Automatically compiles schemas if not already compiled.
   * 
   * @param {Object} message - The message payload to send
   * @throws {Error} If WebSocket connection is not established
   * @throws {Error} If schema compilation fails
   * @throws {Error} If message validation fails against all schemas
   */
  async send_chat_user_left(message){
    if(!this.websocket){
      throw new Error('WebSocket connection not established. Call connect() first.');
    }
    await this.compileOperationSchemas();
    const schemas = this.compiledSchemas['send_chat_user_left'];
    CinemaWebSocketAPI.send_chat_user_left(message, this.websocket, schemas);
  }

  /**
   * Sends a send_chat_user_typing message over the WebSocket connection.
   * 
   * @param {Object} message - The message payload to send. Should match the schema defined in the AsyncAPI document.
   * @param {WebSocket} socket - The WebSocket connection to use.
   * @param {Array<function>} schemas - Array of compiled schema validator functions for this operation.
   * @throws {TypeError} If message cannot be stringified to JSON
   * @throws {Error} If WebSocket connection is not in OPEN state
   * @throws {Error} If message validation fails against all schemas
   */
  static send_chat_user_typing(message, socket, schemas) {
    try {
      if (!schemas || schemas.length === 0) {
        socket.send(JSON.stringify(message));
        return { isValid: true }; 
      }
      const allValidationErrors = [];
      let isValid = false;
      for(const compiledSchema of schemas){
        const validationResult = validateMessage(compiledSchema, message);
        if (validationResult.isValid) {
          isValid = true;
          socket.send(JSON.stringify(message));
          break;
        } else {
          if (validationResult.validationErrors) {
            allValidationErrors.push(...validationResult.validationErrors);
          }
        }
        if (!isValid) {
          console.error('Validation errors:', JSON.stringify(allValidationErrors, null, 2));
        }
      }
    } catch (error) {
      console.error('Error sending send_chat_user_typing message:', error);
    }
  }

  /**
   * Instance method version of send_chat_user_typing that uses the client's own WebSocket connection.
   * Automatically compiles schemas if not already compiled.
   * 
   * @param {Object} message - The message payload to send
   * @throws {Error} If WebSocket connection is not established
   * @throws {Error} If schema compilation fails
   * @throws {Error} If message validation fails against all schemas
   */
  async send_chat_user_typing(message){
    if(!this.websocket){
      throw new Error('WebSocket connection not established. Call connect() first.');
    }
    await this.compileOperationSchemas();
    const schemas = this.compiledSchemas['send_chat_user_typing'];
    CinemaWebSocketAPI.send_chat_user_typing(message, this.websocket, schemas);
  }

  // Method to close the WebSocket connection
   close() {
    if (this.websocket) {
        this.websocket.close();
        console.log('WebSocket connection closed.');
    }
  }
}
module.exports = CinemaWebSocketAPI;

