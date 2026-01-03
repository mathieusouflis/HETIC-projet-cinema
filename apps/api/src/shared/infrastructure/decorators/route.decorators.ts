import 'reflect-metadata';
import { MetadataStorage, type HttpMethod, type RouteMetadata } from './metadata.js';

interface RouteOptions {
  path?: string;
  summary?: string;
  description?: string;
}

function createRouteDecorator(method: HttpMethod) {
  return function (pathOrOptions?: string | RouteOptions) {
    return function (
      target: object,
      propertyKey: string,
      _descriptor?: PropertyDescriptor
    ): void {
      let path = '';
      let summary: string | undefined;
      let description: string | undefined;

      if (typeof pathOrOptions === 'string') {
        path = pathOrOptions;
      } else if (pathOrOptions) {
        path = pathOrOptions.path || '';
        summary = pathOrOptions.summary;
        description = pathOrOptions.description;
      }

      const route: RouteMetadata = {
        method,
        path,
        methodName: propertyKey,
        summary,
        description,
      };

      MetadataStorage.addRoute(target, route);
    };
  };
}

/**
 * GET route decorator
 * @example
 * ```ts
 * @Get('/users')
 * async getUsers() {}
 *
 * @Get({ path: '/users/:id', summary: 'Get user by ID' })
 * async getUser() {}
 * ```
 */
export const Get = createRouteDecorator('get');

/**
 * POST route decorator
 * @example
 * ```ts
 * @Post('/users')
 * async createUser() {}
 * ```
 */
export const Post = createRouteDecorator('post');

/**
 * PUT route decorator
 * @example
 * ```ts
 * @Put('/users/:id')
 * async updateUser() {}
 * ```
 */
export const Put = createRouteDecorator('put');

/**
 * PATCH route decorator
 * @example
 * ```ts
 * @Patch('/users/:id')
 * async patchUser() {}
 * ```
 */
export const Patch = createRouteDecorator('patch');

/**
 * DELETE route decorator
 * @example
 * ```ts
 * @Delete('/users/:id')
 * async deleteUser() {}
 * ```
 */
export const Delete = createRouteDecorator('delete');

export function Summary(summary: string) {
  return function (target: object, propertyKey: string, _descriptor?: PropertyDescriptor): void {
    const routes = MetadataStorage.getRoutes(target);
    const route = routes.find((r) => r.methodName === propertyKey);
    if (route) {
      route.summary = summary;
    }
  };
}

export function Description(description: string) {
  return function (target: object, propertyKey: string, _descriptor?: PropertyDescriptor): void {
    const routes = MetadataStorage.getRoutes(target);
    const route = routes.find((r) => r.methodName === propertyKey);
    if (route) {
      route.description = description;
    }
  };
}
