import { beforeEach, describe, expect, it, vi } from "vitest";
import { MetadataStorage } from "./metadata.js";
import {
  Delete,
  Description,
  Get,
  Patch,
  Post,
  Put,
  Summary,
} from "./route.decorators.js";

describe("Route Decorators tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Get decorator", () => {
    it("should register a GET route with a path string", () => {
      class TestController {
        @Get("/users")
        getUsers() {}
      }

      const routes = MetadataStorage.getRoutes(TestController.prototype);

      expect(routes).toHaveLength(1);
      expect(routes[0]).toMatchObject({
        method: "get",
        path: "/users",
        methodName: "getUsers",
      });
    });

    it("should register a GET route with options object", () => {
      class TestController {
        @Get({
          path: "/users/:id",
          summary: "Get user by ID",
          description: "Retrieves a single user",
        })
        getUser() {}
      }

      const routes = MetadataStorage.getRoutes(TestController.prototype);

      expect(routes).toHaveLength(1);
      expect(routes[0]).toMatchObject({
        method: "get",
        path: "/users/{id}",
        methodName: "getUser",
        summary: "Get user by ID",
        description: "Retrieves a single user",
      });
    });

    it("should register a GET route with empty path when no argument provided", () => {
      class TestController {
        @Get()
        index() {}
      }

      const routes = MetadataStorage.getRoutes(TestController.prototype);

      expect(routes).toHaveLength(1);
      expect(routes[0]).toMatchObject({
        method: "get",
        path: "",
        methodName: "index",
      });
    });

    it("should register a GET route with only summary and description", () => {
      class TestController {
        @Get({ summary: "List items", description: "Get all items" })
        getItems() {}
      }

      const routes = MetadataStorage.getRoutes(TestController.prototype);

      expect(routes[0]).toMatchObject({
        method: "get",
        path: "",
        summary: "List items",
        description: "Get all items",
      });
    });
  });

  describe("Post decorator", () => {
    it("should register a POST route with a path string", () => {
      class TestController {
        @Post("/users")
        createUser() {}
      }

      const routes = MetadataStorage.getRoutes(TestController.prototype);

      expect(routes).toHaveLength(1);
      expect(routes[0]).toMatchObject({
        method: "post",
        path: "/users",
        methodName: "createUser",
      });
    });

    it("should register a POST route with options object", () => {
      class TestController {
        @Post({
          path: "/users",
          summary: "Create user",
          description: "Creates a new user",
        })
        createUser() {}
      }

      const routes = MetadataStorage.getRoutes(TestController.prototype);

      expect(routes[0]).toMatchObject({
        method: "post",
        path: "/users",
        summary: "Create user",
        description: "Creates a new user",
      });
    });

    it("should register a POST route with empty path", () => {
      class TestController {
        @Post()
        create() {}
      }

      const routes = MetadataStorage.getRoutes(TestController.prototype);

      expect(routes[0]).toMatchObject({
        method: "post",
        path: "",
        methodName: "create",
      });
    });
  });

  describe("Put decorator", () => {
    it("should register a PUT route with a path string", () => {
      class TestController {
        @Put("/users/:id")
        updateUser() {}
      }

      const routes = MetadataStorage.getRoutes(TestController.prototype);

      expect(routes).toHaveLength(1);
      expect(routes[0]).toMatchObject({
        method: "put",
        path: "/users/{id}",
        methodName: "updateUser",
      });
    });

    it("should register a PUT route with options object", () => {
      class TestController {
        @Put({ path: "/users/:id", summary: "Update user" })
        updateUser() {}
      }

      const routes = MetadataStorage.getRoutes(TestController.prototype);

      expect(routes[0]).toMatchObject({
        method: "put",
        path: "/users/{id}",
        summary: "Update user",
      });
    });
  });

  describe("Patch decorator", () => {
    it("should register a PATCH route with a path string", () => {
      class TestController {
        @Patch("/users/:id")
        patchUser() {}
      }

      const routes = MetadataStorage.getRoutes(TestController.prototype);

      expect(routes).toHaveLength(1);
      expect(routes[0]).toMatchObject({
        method: "patch",
        path: "/users/{id}",
        methodName: "patchUser",
      });
    });

    it("should register a PATCH route with options object", () => {
      class TestController {
        @Patch({ path: "/users/:id", summary: "Partially update user" })
        patchUser() {}
      }

      const routes = MetadataStorage.getRoutes(TestController.prototype);

      expect(routes[0]).toMatchObject({
        method: "patch",
        path: "/users/{id}",
        summary: "Partially update user",
      });
    });
  });

  describe("Delete decorator", () => {
    it("should register a DELETE route with a path string", () => {
      class TestController {
        @Delete("/users/:id")
        deleteUser() {}
      }

      const routes = MetadataStorage.getRoutes(TestController.prototype);

      expect(routes).toHaveLength(1);
      expect(routes[0]).toMatchObject({
        method: "delete",
        path: "/users/{id}",
        methodName: "deleteUser",
      });
    });

    it("should register a DELETE route with options object", () => {
      class TestController {
        @Delete({
          path: "/users/:id",
          summary: "Delete user",
          description: "Removes a user",
        })
        deleteUser() {}
      }

      const routes = MetadataStorage.getRoutes(TestController.prototype);

      expect(routes[0]).toMatchObject({
        method: "delete",
        path: "/users/{id}",
        summary: "Delete user",
        description: "Removes a user",
      });
    });
  });

  describe("Multiple routes on same controller", () => {
    it("should register multiple routes on the same controller", () => {
      class TestController {
        @Get("/users")
        getUsers() {}

        @Post("/users")
        createUser() {}

        @Get("/users/:id")
        getUser() {}

        @Put("/users/:id")
        updateUser() {}

        @Delete("/users/:id")
        deleteUser() {}
      }

      const routes = MetadataStorage.getRoutes(TestController.prototype);

      expect(routes).toHaveLength(5);

      const methods = routes.map((r) => r.method);
      expect(methods).toContain("get");
      expect(methods).toContain("post");
      expect(methods).toContain("put");
      expect(methods).toContain("delete");
    });

    it("should maintain route order", () => {
      class TestController {
        @Get("/first")
        first() {}

        @Post("/second")
        second() {}

        @Put("/third")
        third() {}
      }

      const routes = MetadataStorage.getRoutes(TestController.prototype);

      expect(routes[0]?.path).toBe("/first");
      expect(routes[1]?.path).toBe("/second");
      expect(routes[2]?.path).toBe("/third");
    });
  });

  describe("Summary decorator", () => {
    it("should add summary to an existing route", () => {
      class TestController {
        @Summary("Get all users")
        @Get("/users")
        getUsers() {}
      }

      const routes = MetadataStorage.getRoutes(TestController.prototype);

      expect(routes[0]?.summary).toBe("Get all users");
    });

    it("should update summary if already defined in route options", () => {
      class TestController {
        @Summary("Updated summary")
        @Get({ path: "/users", summary: "Original summary" })
        getUsers() {}
      }

      const routes = MetadataStorage.getRoutes(TestController.prototype);

      expect(routes[0]?.summary).toBe("Updated summary");
    });

    it("should not affect other route properties", () => {
      class TestController {
        @Summary("List users")
        @Get({ path: "/users", description: "Get all users from database" })
        getUsers() {}
      }

      const routes = MetadataStorage.getRoutes(TestController.prototype);

      expect(routes[0]).toMatchObject({
        method: "get",
        path: "/users",
        methodName: "getUsers",
        summary: "List users",
        description: "Get all users from database",
      });
    });

    it("should handle non-existent route gracefully", () => {
      class TestController {
        @Summary("Some summary")
        someMethod() {}
      }

      const routes = MetadataStorage.getRoutes(TestController.prototype);

      expect(routes).toHaveLength(0);
    });
  });

  describe("Description decorator", () => {
    it("should add description to an existing route", () => {
      class TestController {
        @Description("Retrieves all users from the database")
        @Get("/users")
        getUsers() {}
      }

      const routes = MetadataStorage.getRoutes(TestController.prototype);

      expect(routes[0]?.description).toBe(
        "Retrieves all users from the database"
      );
    });

    it("should update description if already defined in route options", () => {
      class TestController {
        @Description("Updated description")
        @Get({ path: "/users", description: "Original description" })
        getUsers() {}
      }

      const routes = MetadataStorage.getRoutes(TestController.prototype);

      expect(routes[0]?.description).toBe("Updated description");
    });

    it("should not affect other route properties", () => {
      class TestController {
        @Description("Detailed user listing")
        @Get({ path: "/users", summary: "List users" })
        getUsers() {}
      }

      const routes = MetadataStorage.getRoutes(TestController.prototype);

      expect(routes[0]).toMatchObject({
        method: "get",
        path: "/users",
        methodName: "getUsers",
        summary: "List users",
        description: "Detailed user listing",
      });
    });

    it("should handle non-existent route gracefully", () => {
      class TestController {
        @Description("Some description")
        someMethod() {}
      }

      const routes = MetadataStorage.getRoutes(TestController.prototype);

      // Description decorator should not crash if route doesn't exist
      expect(routes).toHaveLength(0);
    });
  });

  describe("Combined decorators", () => {
    it("should support both Summary and Description decorators", () => {
      class TestController {
        @Summary("Get all users")
        @Description("Fetches a list of all registered users")
        @Get("/users")
        getUsers() {}
      }

      const routes = MetadataStorage.getRoutes(TestController.prototype);

      expect(routes[0]).toMatchObject({
        method: "get",
        path: "/users",
        methodName: "getUsers",
        summary: "Get all users",
        description: "Fetches a list of all registered users",
      });
    });

    it("should allow decorators in any order", () => {
      class TestController {
        @Summary("Create user")
        @Description("Creates a new user in the system")
        @Post("/users")
        createUser() {}
      }

      const routes = MetadataStorage.getRoutes(TestController.prototype);

      expect(routes[0]).toMatchObject({
        method: "post",
        path: "/users",
        summary: "Create user",
        description: "Creates a new user in the system",
      });
    });
  });

  describe("Edge cases", () => {
    it("should handle routes with special characters in path", () => {
      class TestController {
        @Get("/users/:id/posts/:postId")
        getUserPost() {}
      }

      const routes = MetadataStorage.getRoutes(TestController.prototype);

      expect(routes[0]?.path).toBe("/users/{id}/posts/{postId}");
    });

    it("should handle routes with query parameters in path", () => {
      class TestController {
        @Get("/search")
        search() {}
      }

      const routes = MetadataStorage.getRoutes(TestController.prototype);

      expect(routes[0]?.path).toBe("/search");
    });

    it("should handle root path", () => {
      class TestController {
        @Get("/")
        root() {}
      }

      const routes = MetadataStorage.getRoutes(TestController.prototype);

      expect(routes[0]?.path).toBe("/");
    });

    it("should preserve undefined summary and description when not provided", () => {
      class TestController {
        @Get("/users")
        getUsers() {}
      }

      const routes = MetadataStorage.getRoutes(TestController.prototype);

      expect(routes[0]?.summary).toBeUndefined();
      expect(routes[0]?.description).toBeUndefined();
    });

    it("should handle methods with same path but different HTTP methods", () => {
      class TestController {
        @Get("/users")
        getUsers() {}

        @Post("/users")
        createUser() {}
      }

      const routes = MetadataStorage.getRoutes(TestController.prototype);

      expect(routes).toHaveLength(2);
      expect(routes[0]?.path).toBe("/users");
      expect(routes[1]?.path).toBe("/users");
      expect(routes[0]?.method).toBe("get");
      expect(routes[1]?.method).toBe("post");
    });
  });

  describe("Metadata structure", () => {
    it("should create proper RouteMetadata structure", () => {
      class TestController {
        @Get({ path: "/test", summary: "Test", description: "Test route" })
        testMethod() {}
      }

      const routes = MetadataStorage.getRoutes(TestController.prototype);
      const route = routes[0];

      expect(route).toHaveProperty("method");
      expect(route).toHaveProperty("path");
      expect(route).toHaveProperty("methodName");
      expect(route).toHaveProperty("summary");
      expect(route).toHaveProperty("description");

      expect(typeof route?.method).toBe("string");
      expect(typeof route?.path).toBe("string");
      expect(typeof route?.methodName).toBe("string");
      expect(typeof route?.summary).toBe("string");
      expect(typeof route?.description).toBe("string");
    });
  });
});
