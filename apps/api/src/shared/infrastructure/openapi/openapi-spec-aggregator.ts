import { OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi';
import type { OpenAPISpec } from '../decorators/router-generator.js';
import { getSharedRegistry } from './shared-registry.js';


export class OpenAPISpecAggregator {

  public generateSpec(): OpenAPISpec {
    const sharedRegistry = getSharedRegistry();

    const generator = new OpenApiGeneratorV3(sharedRegistry.definitions);

    return generator.generateDocument({
      openapi: '3.0.0',
      info: {
        version: '1.0.0',
        title: 'Cinema API',
        description: 'Comprehensive API documentation for the Cinema application',
      },
      servers: [
        {
          url: '/api/v1',
          description: 'API Version 1',
        },
      ],
    }) as OpenAPISpec;
  }
}
