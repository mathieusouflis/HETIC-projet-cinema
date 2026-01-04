import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

extendZodWithOpenApi(z);

export { z };

export const initializeZodOpenAPI = (): void => {
  extendZodWithOpenApi(z);
};
