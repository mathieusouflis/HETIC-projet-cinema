import { describe, it, expect } from 'vitest';
import { ForbiddenError } from './ForbiddenError';

describe('ForbiddenError', () => {
  it('Should instanciate ForbiddenError', () => {
    expect(new ForbiddenError()).toBeDefined();
  });
});
