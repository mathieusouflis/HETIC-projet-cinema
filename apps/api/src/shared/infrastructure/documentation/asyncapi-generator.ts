import "reflect-metadata";
import {
  type EventEmitterMetadata,
  type EventListenerMetadata,
  WebSocketMetadataStorage,
} from "../decorators/web-socket/websocket.metadata.js";

export interface AsyncAPIv3Channel {
  address?: string;
  messages?: {
    [messageId: string]: {
      $ref: string;
    };
  };
  description?: string;
  servers?: Array<{ $ref: string }>;
  parameters?: {
    [key: string]: {
      description?: string;
      enum?: string[];
      default?: string;
      examples?: string[];
      location?: string;
    };
  };
}

export interface AsyncAPIv3Operation {
  action: "send" | "receive";
  channel: {
    $ref: string;
  };
  title?: string;
  summary?: string;
  description?: string;
  reply?: {
    channel?: {
      $ref: string;
    };
  };
}

export interface AsyncAPIv3Message {
  name?: string;
  title?: string;
  summary?: string;
  description?: string;
  payload?: any;
  headers?: any;
}

export interface AsyncAPIv3Server {
  host: string;
  pathname?: string;
  protocol: string;
  description?: string;
  title?: string;
}

export interface AsyncAPIv3Document {
  asyncapi: "3.0.0";
  info: {
    title: string;
    version: string;
    description?: string;
    tags?: Array<{
      name: string;
      description?: string;
    }>;
  };
  servers?: {
    [serverId: string]: AsyncAPIv3Server;
  };
  channels: {
    [channelId: string]: AsyncAPIv3Channel;
  };
  operations: {
    [operationId: string]: AsyncAPIv3Operation;
  };
  components?: {
    messages?: {
      [messageId: string]: AsyncAPIv3Message;
    };
    schemas?: {
      [schemaId: string]: any;
    };
  };
}

export class AsyncAPIGenerator {
  private controllers: Map<string, any> = new Map();
  private schemas: Map<string, any> = new Map();
  private messages: Map<string, AsyncAPIv3Message> = new Map();
  private channels: Map<string, AsyncAPIv3Channel> = new Map();
  private operations: Map<string, AsyncAPIv3Operation> = new Map();

  /**
   * Register a WebSocket controller for documentation generation
   * @param controller - Instance of a WebSocketController with decorators
   */
  public registerController(controller: any): void {
    const namespace = WebSocketMetadataStorage.getNamespace(controller);
    if (namespace) {
      this.controllers.set(namespace.path, controller);
    }
  }

  public generateSpec(options: {
    title: string;
    version: string;
    description?: string;
    serverUrl?: string;
  }): AsyncAPIv3Document {
    this.messages.clear();
    this.channels.clear();
    this.operations.clear();

    this.controllers.forEach((controller, namespacePath) => {
      this.processController(controller, namespacePath);
    });

    const serverUrl = options.serverUrl || "ws://localhost:5001";
    const { host, pathname, protocol } = this.parseServerUrl(serverUrl);

    const asyncAPIDoc: AsyncAPIv3Document = {
      asyncapi: "3.0.0",
      info: {
        title: options.title,
        version: options.version,
        description: options.description,
      },
      servers: {
        production: {
          host,
          pathname,
          protocol,
          description: "WebSocket server",
        },
      },
      channels: Object.fromEntries(this.channels),
      operations: Object.fromEntries(this.operations),
      components: {
        messages: Object.fromEntries(this.messages),
        schemas: Object.fromEntries(this.schemas),
      },
    };

    return asyncAPIDoc;
  }

  /**
   * Parse server URL into host, pathname, and protocol for AsyncAPI v3
   */
  private parseServerUrl(url: string): {
    host: string;
    pathname?: string;
    protocol: string;
  } {
    try {
      // Handle ws:// or wss:// URLs
      const match = url.match(/^(wss?):\/\/([^/]+)(\/.*)?$/);
      if (match?.[1] && match[2]) {
        return {
          protocol: match[1],
          host: match[2],
          pathname: match[3] || undefined,
        };
      }

      return {
        protocol: "ws",
        host: url.replace(/^(wss?:\/\/)?/, ""),
        pathname: undefined,
      };
    } catch (_error) {
      return {
        protocol: "ws",
        host: "localhost:5001",
        pathname: undefined,
      };
    }
  }

  /**
   * Process a single controller
   */
  private processController(controller: any, namespacePath: string): void {
    const namespace = WebSocketMetadataStorage.getNamespace(controller);
    const events = WebSocketMetadataStorage.getEvents(controller);
    const emits = WebSocketMetadataStorage.getEmits(controller);

    // Process subscribe events (client -> server, action: receive)
    for (const event of events) {
      this.processReceiveOperation(
        event,
        controller,
        namespacePath,
        namespace?.description
      );
    }

    // Process publish events (server -> client, action: send)
    for (const emit of emits) {
      this.processSendOperation(emit, namespacePath, namespace?.description);
    }
  }

  /**
   * Process a receive operation (client sends to server)
   * In AsyncAPI v3, this is action: receive (we receive from client)
   */
  private processReceiveOperation(
    event: EventListenerMetadata,
    controller: any,
    namespacePath: string,
    namespaceDescription?: string
  ): void {
    const channelId = this.sanitizeId(`${namespacePath}_${event.eventName}`);
    const messageId = this.sanitizeId(`${event.eventName}_message`);
    const operationId = this.sanitizeId(`receive_${event.eventName}`);

    const validation = WebSocketMetadataStorage.getValidation(
      controller,
      event.methodName
    );

    const messagePayload = validation?.data
      ? this.zodToJsonSchema(validation.data, `${event.eventName}Payload`)
      : { type: "object" };

    const message: AsyncAPIv3Message = {
      name: event.eventName,
      title: event.description || event.eventName,
      description: event.description,
      payload: messagePayload,
    };
    this.messages.set(messageId, message);

    if (!this.channels.has(channelId)) {
      this.channels.set(channelId, {
        address: `${namespacePath}/${event.eventName}`,
        description: event.description || namespaceDescription,
        messages: {},
      });
    }

    const channel = this.channels.get(channelId)!;
    if (!channel.messages) {
      channel.messages = {};
    }
    channel.messages[messageId] = {
      $ref: `#/components/messages/${messageId}`,
    };

    const operation: AsyncAPIv3Operation = {
      action: "receive",
      channel: { $ref: `#/channels/${channelId}` },
      title: `Receive ${event.eventName}`,
      summary: event.description || `Receive ${event.eventName} from client`,
    };

    // Add reply (acknowledgment) if specified
    if (event.acknowledgment && validation?.ack) {
      const ackMessageId = this.sanitizeId(`${event.eventName}_ack_message`);
      const ackChannelId = this.sanitizeId(
        `${namespacePath}_${event.eventName}_ack`
      );

      // Create acknowledgment message
      const ackPayload = this.zodToJsonSchema(
        validation.ack,
        `${event.eventName}AckPayload`
      );

      const ackMessage: AsyncAPIv3Message = {
        name: `${event.eventName}Ack`,
        title: `${event.eventName} Acknowledgment`,
        description: `Acknowledgment response for ${event.eventName}`,
        payload: ackPayload,
      };
      this.messages.set(ackMessageId, ackMessage);

      // Create acknowledgment channel
      this.channels.set(ackChannelId, {
        address: `${namespacePath}/${event.eventName}/ack`,
        description: `Acknowledgment channel for ${event.eventName}`,
        messages: {
          [ackMessageId]: { $ref: `#/components/messages/${ackMessageId}` },
        },
      });

      // Add reply to operation (without messages array, they come from channel)
      operation.reply = {
        channel: { $ref: `#/channels/${ackChannelId}` },
      };
    }

    this.operations.set(operationId, operation);
  }

  /**
   * Process a send operation (server sends to client)
   * In AsyncAPI v3, this is action: send (we send to client)
   */
  private processSendOperation(
    emit: EventEmitterMetadata,
    namespacePath: string,
    namespaceDescription?: string
  ): void {
    const channelId = this.sanitizeId(`${namespacePath}_${emit.eventName}`);
    const messageId = this.sanitizeId(`${emit.eventName}_message`);
    const operationId = this.sanitizeId(`send_${emit.eventName}`);

    // Create message with proper schema
    const messagePayload = emit.validation
      ? this.zodToJsonSchema(emit.validation, `${emit.eventName}Payload`)
      : { type: "object" };

    const message: AsyncAPIv3Message = {
      name: emit.eventName,
      title: emit.description || emit.eventName,
      description: emit.description,
      payload: messagePayload,
    };
    this.messages.set(messageId, message);

    // Create or update channel
    if (!this.channels.has(channelId)) {
      this.channels.set(channelId, {
        address: `${namespacePath}/${emit.eventName}`,
        description: emit.description || namespaceDescription,
        messages: {},
      });
    }

    const channel = this.channels.get(channelId)!;
    if (!channel.messages) {
      channel.messages = {};
    }
    channel.messages[messageId] = {
      $ref: `#/components/messages/${messageId}`,
    };

    // Create operation (send to client)
    // In AsyncAPI v3, operations don't reference messages directly
    // They inherit messages from the channel they reference
    const operation: AsyncAPIv3Operation = {
      action: "send",
      channel: { $ref: `#/channels/${channelId}` },
      title: `Send ${emit.eventName}`,
      summary: emit.description || `Send ${emit.eventName} to client`,
    };

    this.operations.set(operationId, operation);
  }

  /**
   * Sanitize ID to be a valid AsyncAPI identifier
   */
  private sanitizeId(id: string): string {
    return id.replace(/[^a-zA-Z0-9_]/g, "_");
  }

  /**
   * Convert Zod schema to JSON Schema (custom implementation for Zod v4)
   */
  private zodToJsonSchema(zodSchema: any, _name: string): any {
    try {
      // Custom converter for Zod v4 compatibility
      return this.convertZodToJsonSchema(zodSchema);
    } catch (_error) {
      return { type: "object" };
    }
  }

  /**
   * Custom Zod to JSON Schema converter (Zod v4 compatible)
   */
  private convertZodToJsonSchema(schema: any): any {
    if (!schema || (!schema._def && !schema.def)) {
      return { type: "object" };
    }

    const def = schema.def || schema._def;
    const typeName = def.type || def.typeName;

    switch (typeName) {
      case "object":
      case "ZodObject": {
        const properties: any = {};
        const required: string[] = [];
        const shape = typeof def.shape === "function" ? def.shape() : def.shape;

        for (const [key, value] of Object.entries(shape || {})) {
          properties[key] = this.convertZodToJsonSchema(value);
          const valueDef = (value as any).def || (value as any)._def;
          if (
            valueDef &&
            valueDef.type !== "optional" &&
            valueDef.typeName !== "ZodOptional"
          ) {
            required.push(key);
          }
        }

        const result: any = {
          type: "object",
          properties,
        };

        if (required.length > 0) {
          result.required = required;
        }

        return result;
      }

      case "string":
      case "ZodString": {
        const result: any = { type: "string" };

        if (def.checks && Array.isArray(def.checks)) {
          for (const check of def.checks) {
            const checkDef = check.def || check;
            const checkType = checkDef.check || checkDef.kind;

            if (checkType === "min" || checkType === "string_min") {
              result.minLength = checkDef.value || checkDef.min;
            } else if (checkType === "max" || checkType === "string_max") {
              result.maxLength = checkDef.value || checkDef.max;
            } else if (checkType === "email" || checkType === "string_format") {
              if (checkDef.format === "email" || checkType === "email") {
                result.format = "email";
              } else if (checkDef.format === "uuid") {
                result.format = "uuid";
              } else if (checkDef.format === "url") {
                result.format = "uri";
              } else if (checkDef.format) {
                result.format = checkDef.format;
              }
            } else if (checkType === "regex") {
              result.pattern =
                checkDef.regex?.source || checkDef.pattern?.source;
            }
          }
        }

        if (schema.format) {
          result.format = schema.format;
        }

        return result;
      }

      case "number":
      case "ZodNumber": {
        const result: any = { type: "number" };

        if (def.checks && Array.isArray(def.checks)) {
          for (const check of def.checks) {
            const checkDef = check.def || check;
            const checkType = checkDef.check || checkDef.kind;

            if (checkType === "min") {
              result.minimum = checkDef.value || checkDef.min;
            } else if (checkType === "max") {
              result.maximum = checkDef.value || checkDef.max;
            } else if (checkType === "int") {
              result.type = "integer";
            }
          }
        }

        return result;
      }

      case "boolean":
      case "ZodBoolean":
        return { type: "boolean" };

      case "array":
      case "ZodArray": {
        return {
          type: "array",
          items: this.convertZodToJsonSchema(def.type || def.element),
        };
      }

      case "enum":
      case "ZodEnum": {
        return {
          type: "string",
          enum: def.values,
        };
      }

      case "optional":
      case "ZodOptional":
      case "nullable":
      case "ZodNullable":
        return this.convertZodToJsonSchema(def.innerType || def.unwrap?.());

      case "union":
      case "ZodUnion": {
        const options = def.options || def.types || [];
        return {
          anyOf: options.map((opt: any) => this.convertZodToJsonSchema(opt)),
        };
      }

      case "literal":
      case "ZodLiteral":
        return {
          type: typeof def.value,
          const: def.value,
        };

      case "date":
      case "ZodDate":
        return {
          type: "string",
          format: "date-time",
        };

      case "record":
      case "ZodRecord": {
        return {
          type: "object",
          additionalProperties: this.convertZodToJsonSchema(
            def.valueType || def.value
          ),
        };
      }

      default:
        return { type: "object" };
    }
  }

  /**
   * Export specification as JSON string
   */
  public toJSON(options: {
    title: string;
    version: string;
    description?: string;
    serverUrl?: string;
  }): string {
    return JSON.stringify(this.generateSpec(options), null, 2);
  }

  /**
   * Export specification as YAML string
   */
  public toYAML(options: {
    title: string;
    version: string;
    description?: string;
    serverUrl?: string;
  }): string {
    const spec = this.generateSpec(options);
    return this.jsonToYAML(spec);
  }

  /**
   * Simple JSON to YAML converter
   * For production use, consider using a library like 'js-yaml'
   */
  private jsonToYAML(obj: any, indent = 0): string {
    const spaces = "  ".repeat(indent);
    let yaml = "";

    for (const [key, value] of Object.entries(obj)) {
      if (value === null || value === undefined) {
        continue;
      }

      if (typeof value === "object" && !Array.isArray(value)) {
        yaml += `${spaces}${key}:\n`;
        yaml += this.jsonToYAML(value, indent + 1);
      } else if (Array.isArray(value)) {
        yaml += `${spaces}${key}:\n`;
        for (const item of value) {
          if (typeof item === "object") {
            yaml += `${spaces}  -\n`;
            yaml += this.jsonToYAML(item, indent + 2);
          } else {
            yaml += `${spaces}  - ${item}\n`;
          }
        }
      } else {
        const valueStr =
          typeof value === "string" ? `"${value}"` : String(value);
        yaml += `${spaces}${key}: ${valueStr}\n`;
      }
    }

    return yaml;
  }

  /**
   * Get all registered controllers
   */
  public getControllers(): Map<string, any> {
    return this.controllers;
  }

  /**
   * Clear all registered controllers and schemas
   */
  public clear(): void {
    this.controllers.clear();
    this.schemas.clear();
    this.messages.clear();
    this.channels.clear();
    this.operations.clear();
  }
}

export const asyncAPIGenerator = new AsyncAPIGenerator();
