import { describe, it, expect, beforeEach, vi } from "vitest";
import type { Router } from "express";
import { ModuleRegistry, type IApiModule } from "./module-registry.js";

describe("ModuleRegistry tests", () => {
  let registry: ModuleRegistry;

  beforeEach(() => {
    registry = new ModuleRegistry();
  });

  describe("Module registration", () => {
    it("should register a new module", () => {
      const mockRouter = {} as Router;
      const mockModule: IApiModule = {
        getRouter: () => mockRouter,
      };

      registry.register("testModule", mockModule);

      expect(registry.hasModule("testModule")).toBe(true);
      expect(registry.getModule("testModule")).toBe(mockModule);
    });

    it("should throw error when registering duplicate module", () => {
      const mockRouter = {} as Router;
      const mockModule: IApiModule = {
        getRouter: () => mockRouter,
      };

      registry.register("testModule", mockModule);

      expect(() => {
        registry.register("testModule", mockModule);
      }).toThrow('Module "testModule" is already registered');
    });

    it("should register multiple modules with different names", () => {
      const mockRouter1 = {} as Router;
      const mockRouter2 = {} as Router;
      const module1: IApiModule = {
        getRouter: () => mockRouter1,
      };
      const module2: IApiModule = {
        getRouter: () => mockRouter2,
      };

      registry.register("module1", module1);
      registry.register("module2", module2);

      expect(registry.hasModule("module1")).toBe(true);
      expect(registry.hasModule("module2")).toBe(true);
      expect(registry.getModuleCount()).toBe(2);
    });

    it("should allow registering modules with same instance but different names", () => {
      const mockRouter = {} as Router;
      const mockModule: IApiModule = {
        getRouter: () => mockRouter,
      };

      registry.register("instance1", mockModule);
      registry.register("instance2", mockModule);

      expect(registry.getModuleCount()).toBe(2);
      expect(registry.getModule("instance1")).toBe(mockModule);
      expect(registry.getModule("instance2")).toBe(mockModule);
    });
  });

  describe("Module retrieval", () => {
    it("should retrieve a registered module", () => {
      const mockRouter = {} as Router;
      const mockModule: IApiModule = {
        getRouter: () => mockRouter,
      };

      registry.register("testModule", mockModule);
      const retrieved = registry.getModule("testModule");

      expect(retrieved).toBe(mockModule);
    });

    it("should return undefined for non-existent module", () => {
      const result = registry.getModule("nonExistent");

      expect(result).toBeUndefined();
    });

    it("should retrieve the correct module from multiple registered modules", () => {
      const mockRouter1 = {} as Router;
      const mockRouter2 = {} as Router;
      const module1: IApiModule = {
        getRouter: () => mockRouter1,
      };
      const module2: IApiModule = {
        getRouter: () => mockRouter2,
      };

      registry.register("module1", module1);
      registry.register("module2", module2);

      expect(registry.getModule("module1")).toBe(module1);
      expect(registry.getModule("module2")).toBe(module2);
    });
  });

  describe("getAllModules", () => {
    it("should return empty array when no modules registered", () => {
      const modules = registry.getAllModules();

      expect(modules).toEqual([]);
      expect(modules).toHaveLength(0);
    });

    it("should return all registered modules", () => {
      const mockRouter1 = {} as Router;
      const mockRouter2 = {} as Router;
      const module1: IApiModule = {
        getRouter: () => mockRouter1,
      };
      const module2: IApiModule = {
        getRouter: () => mockRouter2,
      };

      registry.register("module1", module1);
      registry.register("module2", module2);

      const modules = registry.getAllModules();

      expect(modules).toHaveLength(2);
      expect(modules).toContain(module1);
      expect(modules).toContain(module2);
    });

    it("should return array of modules not affecting original registry", () => {
      const mockRouter = {} as Router;
      const mockModule: IApiModule = {
        getRouter: () => mockRouter,
      };

      registry.register("testModule", mockModule);
      const modules = registry.getAllModules();
      modules.pop();

      expect(registry.getModuleCount()).toBe(1);
    });
  });

  describe("getModuleNames", () => {
    it("should return empty array when no modules registered", () => {
      const names = registry.getModuleNames();

      expect(names).toEqual([]);
      expect(names).toHaveLength(0);
    });

    it("should return all registered module names", () => {
      const mockRouter = {} as Router;
      const mockModule: IApiModule = {
        getRouter: () => mockRouter,
      };

      registry.register("module1", mockModule);
      registry.register("module2", mockModule);
      registry.register("module3", mockModule);

      const names = registry.getModuleNames();

      expect(names).toHaveLength(3);
      expect(names).toContain("module1");
      expect(names).toContain("module2");
      expect(names).toContain("module3");
    });

    it("should return array of names not affecting original registry", () => {
      const mockRouter = {} as Router;
      const mockModule: IApiModule = {
        getRouter: () => mockRouter,
      };

      registry.register("testModule", mockModule);
      const names = registry.getModuleNames();
      names.pop();

      expect(registry.getModuleCount()).toBe(1);
    });
  });

  describe("hasModule", () => {
    it("should return true for registered module", () => {
      const mockRouter = {} as Router;
      const mockModule: IApiModule = {
        getRouter: () => mockRouter,
      };

      registry.register("testModule", mockModule);

      expect(registry.hasModule("testModule")).toBe(true);
    });

    it("should return false for non-existent module", () => {
      expect(registry.hasModule("nonExistent")).toBe(false);
    });

    it("should return false for module name with different case", () => {
      const mockRouter = {} as Router;
      const mockModule: IApiModule = {
        getRouter: () => mockRouter,
      };

      registry.register("testModule", mockModule);

      expect(registry.hasModule("TestModule")).toBe(false);
      expect(registry.hasModule("TESTMODULE")).toBe(false);
    });
  });

  describe("getModuleCount", () => {
    it("should return 0 for empty registry", () => {
      expect(registry.getModuleCount()).toBe(0);
    });

    it("should return correct count after registering modules", () => {
      const mockRouter = {} as Router;
      const mockModule: IApiModule = {
        getRouter: () => mockRouter,
      };

      registry.register("module1", mockModule);
      expect(registry.getModuleCount()).toBe(1);

      registry.register("module2", mockModule);
      expect(registry.getModuleCount()).toBe(2);

      registry.register("module3", mockModule);
      expect(registry.getModuleCount()).toBe(3);
    });

    it("should return correct count after clearing", () => {
      const mockRouter = {} as Router;
      const mockModule: IApiModule = {
        getRouter: () => mockRouter,
      };

      registry.register("module1", mockModule);
      registry.register("module2", mockModule);
      expect(registry.getModuleCount()).toBe(2);

      registry.clear();
      expect(registry.getModuleCount()).toBe(0);
    });
  });

  describe("clear", () => {
    it("should remove all modules", () => {
      const mockRouter = {} as Router;
      const mockModule: IApiModule = {
        getRouter: () => mockRouter,
      };

      registry.register("module1", mockModule);
      registry.register("module2", mockModule);
      registry.register("module3", mockModule);

      registry.clear();

      expect(registry.getModuleCount()).toBe(0);
      expect(registry.getAllModules()).toEqual([]);
      expect(registry.getModuleNames()).toEqual([]);
    });

    it("should allow re-registering modules after clear", () => {
      const mockRouter = {} as Router;
      const mockModule: IApiModule = {
        getRouter: () => mockRouter,
      };

      registry.register("testModule", mockModule);
      registry.clear();
      registry.register("testModule", mockModule);

      expect(registry.hasModule("testModule")).toBe(true);
      expect(registry.getModuleCount()).toBe(1);
    });

    it("should work on empty registry", () => {
      expect(() => {
        registry.clear();
      }).not.toThrow();

      expect(registry.getModuleCount()).toBe(0);
    });
  });

  describe("IApiModule interface", () => {
    it("should work with module that returns router", () => {
      const mockRouter = { use: vi.fn(), get: vi.fn() } as unknown as Router;
      const mockModule: IApiModule = {
        getRouter: () => mockRouter,
      };

      registry.register("testModule", mockModule);
      const module = registry.getModule("testModule");
      const router = module?.getRouter();

      expect(router).toBe(mockRouter);
    });

    it("should call getRouter method when accessing router", () => {
      const mockRouter = {} as Router;
      const getRouterSpy = vi.fn().mockReturnValue(mockRouter);
      const mockModule: IApiModule = {
        getRouter: getRouterSpy,
      };

      registry.register("testModule", mockModule);
      const module = registry.getModule("testModule");
      module?.getRouter();

      expect(getRouterSpy).toHaveBeenCalledOnce();
    });
  });

  describe("Edge cases", () => {
    it("should handle empty string as module name", () => {
      const mockRouter = {} as Router;
      const mockModule: IApiModule = {
        getRouter: () => mockRouter,
      };

      registry.register("", mockModule);

      expect(registry.hasModule("")).toBe(true);
      expect(registry.getModule("")).toBe(mockModule);
    });

    it("should handle module names with special characters", () => {
      const mockRouter = {} as Router;
      const mockModule: IApiModule = {
        getRouter: () => mockRouter,
      };

      const specialNames = [
        "module-with-dashes",
        "module_with_underscores",
        "module.with.dots",
        "module/with/slashes",
        "module@version",
      ];

      specialNames.forEach((name) => {
        registry.register(name, mockModule);
        expect(registry.hasModule(name)).toBe(true);
      });

      expect(registry.getModuleCount()).toBe(specialNames.length);
    });

    it("should handle very long module names", () => {
      const mockRouter = {} as Router;
      const mockModule: IApiModule = {
        getRouter: () => mockRouter,
      };

      const longName = "a".repeat(1000);
      registry.register(longName, mockModule);

      expect(registry.hasModule(longName)).toBe(true);
      expect(registry.getModule(longName)).toBe(mockModule);
    });

    it("should maintain module order in getAllModules", () => {
      const mockRouter = {} as Router;
      const module1: IApiModule = { getRouter: () => mockRouter };
      const module2: IApiModule = { getRouter: () => mockRouter };
      const module3: IApiModule = { getRouter: () => mockRouter };

      registry.register("first", module1);
      registry.register("second", module2);
      registry.register("third", module3);

      const modules = registry.getAllModules();

      // Note: Map iteration order is insertion order
      expect(modules[0]).toBe(module1);
      expect(modules[1]).toBe(module2);
      expect(modules[2]).toBe(module3);
    });
  });

  describe("Singleton moduleRegistry", () => {
    it("should export a singleton instance", async () => {
      const { moduleRegistry } = await import("./module-registry.js");

      expect(moduleRegistry).toBeInstanceOf(ModuleRegistry);
    });

    it("should be the same instance across imports", async () => {
      const import1 = await import("./module-registry.js");
      const import2 = await import("./module-registry.js");

      expect(import1.moduleRegistry).toBe(import2.moduleRegistry);
    });
  });

  describe("Module registry state isolation", () => {
    it("should not share state between different registry instances", () => {
      const registry1 = new ModuleRegistry();
      const registry2 = new ModuleRegistry();

      const mockRouter = {} as Router;
      const mockModule: IApiModule = {
        getRouter: () => mockRouter,
      };

      registry1.register("testModule", mockModule);

      expect(registry1.hasModule("testModule")).toBe(true);
      expect(registry2.hasModule("testModule")).toBe(false);
      expect(registry1.getModuleCount()).toBe(1);
      expect(registry2.getModuleCount()).toBe(0);
    });
  });

  describe("Type safety", () => {
    it("should accept any object implementing IApiModule interface", () => {
      const mockRouter = {} as Router;

      class CustomModule implements IApiModule {
        getRouter(): Router {
          return mockRouter;
        }
      }

      const customModule = new CustomModule();

      expect(() => {
        registry.register("custom", customModule);
      }).not.toThrow();

      expect(registry.getModule("custom")).toBe(customModule);
    });

    it("should work with modules having additional properties", () => {
      const mockRouter = {} as Router;

      const extendedModule = {
        getRouter: () => mockRouter,
        extraProperty: "extra",
        extraMethod: () => "method",
      };

      registry.register("extended", extendedModule);

      const retrieved = registry.getModule("extended") as typeof extendedModule;

      expect(retrieved.extraProperty).toBe("extra");
      expect(retrieved.extraMethod()).toBe("method");
    });
  });
});
