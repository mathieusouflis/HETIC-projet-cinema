export { BaseController } from '../base/BaseController.js';

export { Controller } from './controller.decorator.js';

export {
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Summary,
  Description,
} from './route.decorators.js';

export {
  ValidateBody,
  ValidateParams,
  ValidateQuery,
} from './validation.decorators.js';

export { ApiResponse } from './response.decorator.js';

export { Protected, Middlewares } from './auth.decorator.js';

export {
  DecoratorRouter,
  generateRouterFromController,
  generateOpenAPIFromController,
  type OpenAPISpec,
} from './router-generator.js';

export {
  METADATA_KEYS,
  MetadataStorage,
  type HttpMethod,
  type ControllerMetadata,
  type RouteMetadata,
  type ValidationMetadata,
  type ResponseMetadata,
} from './metadata.js';

export {
  type ControllerConstructor,
  type RouteHandler,
  type MiddlewareStack,
  AUTH_MIDDLEWARE_MARKER,
  isRouteHandler,
  isController,
} from './types.js';
