import 'reflect-metadata';
import { Router, type RequestHandler } from 'express';
import {
  OpenAPIRegistry,
  OpenApiGeneratorV3,
  type RouteConfig,
} from '@asteasolutions/zod-to-openapi';
import {
  METADATA_KEYS,
  MetadataStorage,
  type RouteMetadata,
  type ValidationMetadata,
  type ResponseMetadata,
} from './metadata.js';
import { validateRequest } from '../../middleware/validation.middleware.js';
import { getMiddlewaresMetadata } from './auth.decorator.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import { AUTH_MIDDLEWARE_MARKER, BaseController } from './types.js';
import { getSharedRegistry } from '../openapi/shared-registry.js';

export interface OpenAPISpec {
  openapi: string;
  info: {
    title: string;
    version: string;
    description?: string;
  };
  servers?: Array<{ url: string; description?: string }>;
  paths?: Record<string, unknown>;
  components?: Record<string, unknown>;
  tags?: Array<{ name: string; description?: string }>;
}

export class DecoratorRouter {
  private registry: OpenAPIRegistry;
  private router: Router;

  constructor() {
    this.registry = getSharedRegistry();
    this.router = Router();
  }

  public generateRouter(controllerInstance: BaseController): Router {
    const prototype = Object.getPrototypeOf(controllerInstance) as object;
    const routes = MetadataStorage.getRoutes(prototype);
    const controllerMetadata = MetadataStorage.getControllerMetadata(prototype);

    routes.forEach((route) => {
      this.registerRoute(controllerInstance, route, controllerMetadata?.prefix);
    });

    return this.router;
  }

  private registerRoute(
    controllerInstance: BaseController,
    route: RouteMetadata,
    prefix?: string
  ): void {
    const prototype = Object.getPrototypeOf(controllerInstance) as object;

    const validationKey = `${METADATA_KEYS.ROUTE_VALIDATION.toString()}_${route.methodName}`;
    const validationMetadata: ValidationMetadata =
      Reflect.getMetadata(validationKey, prototype) || {};

    const fullPath = prefix ? `${prefix}${route.path}` : route.path;

    const handler = controllerInstance[route.methodName];

    if (typeof handler !== 'function') {
      throw new Error(
        `Handler "${route.methodName}" is not a function on controller`
      );
    }

    const middlewares: RequestHandler[] = [];

    if (validationMetadata.body) {
      middlewares.push(validateRequest(validationMetadata.body, 'body'));
    }
    if (validationMetadata.params) {
      middlewares.push(validateRequest(validationMetadata.params, 'params'));
    }
    if (validationMetadata.query) {
      middlewares.push(validateRequest(validationMetadata.query, 'query'));
    }

    const middlewaresMetadata = getMiddlewaresMetadata(prototype, route.methodName);
    if (middlewaresMetadata?.middlewares) {
      middlewaresMetadata.middlewares.forEach((middleware) => {
        if (middleware === AUTH_MIDDLEWARE_MARKER) {
          middlewares.push(authMiddleware);
        } else {
          middlewares.push(middleware);
        }
      });
    }

    middlewares.push(handler as RequestHandler);

    this.router[route.method](fullPath, ...middlewares);

    this.registerOpenAPIRoute(route, validationMetadata, fullPath, controllerInstance);
  }

  private registerOpenAPIRoute(
    route: RouteMetadata,
    validation: ValidationMetadata,
    fullPath: string,
    controllerInstance: BaseController
  ): void {
    const prototype = Object.getPrototypeOf(controllerInstance) as object;
    const controllerMetadata = MetadataStorage.getControllerMetadata(prototype);

    const middlewaresMetadata = getMiddlewaresMetadata(prototype, route.methodName);
    const isProtected = middlewaresMetadata?.middlewares?.some(
      (m) => m === AUTH_MIDDLEWARE_MARKER
    );

    const responseKey = `${METADATA_KEYS.OPENAPI_RESPONSES.toString()}_${route.methodName}`;
    const responses: ResponseMetadata[] =
      Reflect.getMetadata(responseKey, prototype) || [];

    const requestSchema: RouteConfig['request'] = {};

    if (validation.params) {
      requestSchema.params = validation.params as RouteConfig['request'] extends { params?: infer P } ? P : never;
    }
    if (validation.query) {
      requestSchema.query = validation.query as RouteConfig['request'] extends { query?: infer Q } ? Q : never;
    }
    if (validation.body) {
      requestSchema.body = {
        content: {
          'application/json': {
            schema: validation.body,
          },
        },
      };
    }

    const responseSchema: RouteConfig['responses'] = {};
    responses.forEach((resp) => {
      responseSchema[resp.statusCode] = {
        description: resp.description,
        ...(resp.schema && {
          content: {
            'application/json': {
              schema: resp.schema,
            },
          },
        }),
      };
    });

    this.registry.registerPath({
      method: route.method,
      path: fullPath,
      summary: route.summary,
      description: route.description,
      tags: controllerMetadata?.tag ? [controllerMetadata.tag] : undefined,
      request: Object.keys(requestSchema).length > 0 ? requestSchema : undefined,
      responses: Object.keys(responseSchema).length > 0 ? responseSchema : {},
      security: isProtected ? [{ BearerAuth: [] }] : undefined,
    });
  }


  public generateOpenAPISpec(): OpenAPISpec {
    const generator = new OpenApiGeneratorV3(this.registry.definitions);

    return generator.generateDocument({
      openapi: '3.0.0',
      info: {
        version: '1.0.0',
        title: 'Cinema API',
        description: 'API for cinema application',
      },
      servers: [{ url: '/api/v1' }],
    }) as OpenAPISpec;
  }


  public getRouter(): Router {
    return this.router;
  }


  public getRegistry(): OpenAPIRegistry {
    return this.registry;
  }
}


export function generateRouterFromController(controllerInstance: BaseController): Router {
  const decoratorRouter = new DecoratorRouter();
  return decoratorRouter.generateRouter(controllerInstance);
}


export function generateOpenAPIFromController(controllerInstance: BaseController): OpenAPISpec {
  const decoratorRouter = new DecoratorRouter();
  decoratorRouter.generateRouter(controllerInstance);
  return decoratorRouter.generateOpenAPISpec();
}
