import { initializeZodOpenAPI } from "./zod-openapi";

describe("ZodOpenAPI", () => {
  it("Initialize", () => {
    expect(() => initializeZodOpenAPI()).not.toThrow();
  });
});
