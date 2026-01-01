---
description: Complete development guide for extending and maintaining the Cinema API
---

# Development Guide

This section provides comprehensive guidance for developing and extending the Cinema API. Whether you're adding new features, fixing bugs, or improving existing functionality, these guides will help you work effectively with our Clean Architecture implementation.

## 🎯 What You'll Learn

The development guide covers:

- **Module Creation** - Building new features following Clean Architecture
- **Endpoint Development** - Adding new API endpoints to existing modules
- **Testing Strategies** - Writing comprehensive tests for your code
- **Error Handling** - Implementing robust error management
- **Best Practices** - Code quality, patterns, and conventions

## 📋 Prerequisites

Before diving into development, ensure you have:

### Technical Requirements
- Completed [Getting Started](../guides/) setup
- Understanding of [Clean Architecture](../architecture/clean-architecture.md)
- Familiarity with [Project Structure](../architecture/project-structure.md)
- Basic knowledge of [Module Pattern](../architecture/module-pattern.md)

### Development Environment
- API running locally (`pnpm dev`)
- Database connected and migrated
- Tests passing (`pnpm test`)
- Code editor configured (VS Code recommended)

## 🏗️ Development Workflow

### 1. Planning Phase
Before writing code:
```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Review existing architecture
# - Check similar modules for patterns
# - Review domain models
# - Plan database schema changes
```

### 2. Development Phase
Follow Test-Driven Development (TDD):
```bash
# Write failing tests first
pnpm test --watch

# Implement feature
# - Domain layer first
# - Application layer
# - Infrastructure layer
# - Presentation layer

# Verify tests pass
pnpm test
```

### 3. Quality Assurance
Ensure code quality:
```bash
# Run full test suite
pnpm test

# Check type safety
pnpm type-check

# Lint code
pnpm lint

# Format code
pnpm format
```

### 4. Documentation
Update documentation:
- Add API documentation for new endpoints
- Update architecture docs for new modules
- Include usage examples
- Update this development guide if needed

## 📚 Development Guides

### [Creating a New Module](creating-a-new-module.md)
Learn how to build complete new features:

**What you'll build**: A complete module following Clean Architecture
**Time required**: 2-3 hours
**Complexity**: Intermediate

**Topics covered**:
- Domain layer design (entities, interfaces, business rules)
- Application layer implementation (use cases, DTOs)
- Infrastructure layer setup (repositories, database schemas)
- Presentation layer creation (routes, controllers, middleware)
- Dependency injection configuration
- Complete testing strategy

**When to use**: Adding major new features like films, ratings, watchparties

### [Adding Endpoints](adding-endpoints.md)
Extend existing modules with new API endpoints:

**What you'll build**: New API endpoints in existing modules
**Time required**: 30-60 minutes
**Complexity**: Beginner to Intermediate

**Topics covered**:
- Route definition and HTTP method selection
- Controller implementation patterns
- Request validation with Zod schemas
- Response formatting and error handling
- Middleware integration
- Endpoint testing strategies

**When to use**: Adding functionality to existing features (e.g., new user endpoints)

### [Writing Tests](writing-tests.md)
Comprehensive testing strategies for all layers:

**What you'll learn**: Complete testing approaches
**Time required**: 1-2 hours
**Complexity**: Intermediate

**Topics covered**:
- Unit testing domain logic
- Integration testing use cases
- API endpoint testing with Supertest
- Database testing with test containers
- Mocking strategies and dependency injection
- Test data management and factories

**When to use**: Essential for all development work

### [Error Handling](error-handling.md)
Implement robust error management:

**What you'll learn**: Comprehensive error handling patterns
**Time required**: 1-2 hours
**Complexity**: Intermediate

**Topics covered**:
- Custom error class hierarchy
- Domain-specific error types
- Global error middleware
- Client-friendly error responses
- Error logging and monitoring
- Validation error handling

**When to use**: Building production-ready features

## 🎨 Code Quality Standards

### TypeScript Best Practices
```typescript
// ✅ Good: Clear interfaces and types
interface CreateUserRequest {
  email: string;
  username: string;
  password: string;
}

export class CreateUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordService: IPasswordService
  ) {}

  async execute(request: CreateUserRequest): Promise<UserResponseDTO> {
    // Implementation with proper error handling
  }
}

// ❌ Avoid: Unclear types and missing error handling
const createUser = (data: any) => {
  // Implementation without proper typing
};
```

### Clean Architecture Compliance
```typescript
// ✅ Good: Proper layer separation
// Domain layer - no external dependencies
export class User {
  constructor(
    public readonly id: string,
    public readonly email: string
  ) {}

  public canBeDeleted(): boolean {
    // Pure business logic
    return this.isActive === false;
  }
}

// Application layer - orchestrates business logic
export class DeleteUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(userId: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new UserNotFoundError(userId);
    
    if (!user.canBeDeleted()) {
      throw new UserCannotBeDeletedError(userId);
    }

    await this.userRepository.delete(userId);
  }
}

// ❌ Avoid: Mixed concerns and direct database access
export class DeleteUserController {
  async deleteUser(req: Request, res: Response) {
    // DON'T: Business logic in controller
    const user = await db.select().from(users).where(eq(users.id, req.params.id));
    if (user.isActive) {
      return res.status(400).json({ error: 'Cannot delete active user' });
    }
    await db.delete(users).where(eq(users.id, req.params.id));
  }
}
```

### Testing Standards
```typescript
// ✅ Good: Comprehensive test coverage
describe('CreateUserUseCase', () => {
  let useCase: CreateUserUseCase;
  let mockUserRepository: jest.Mocked<IUserRepository>;
  let mockPasswordService: jest.Mocked<IPasswordService>;

  beforeEach(() => {
    mockUserRepository = createMockUserRepository();
    mockPasswordService = createMockPasswordService();
    useCase = new CreateUserUseCase(mockUserRepository, mockPasswordService);
  });

  it('should create user when valid data provided', async () => {
    // Arrange
    const request = createValidUserRequest();
    mockUserRepository.existsByEmail.mockResolvedValue(false);
    mockPasswordService.hash.mockResolvedValue('hashedPassword');

    // Act
    const result = await useCase.execute(request);

    // Assert
    expect(result).toBeDefined();
    expect(mockUserRepository.create).toHaveBeenCalledWith({
      ...request,
      passwordHash: 'hashedPassword'
    });
  });

  it('should throw error when email already exists', async () => {
    // Test error cases
  });
});
```

## 🔧 Development Tools

### Essential Commands
```bash
# Development workflow
pnpm dev                 # Start development server
pnpm test               # Run tests
pnpm test:watch         # Run tests in watch mode
pnpm lint               # Lint code
pnpm type-check         # TypeScript type checking
pnpm format             # Format code with Prettier

# Database operations
pnpm db:migrate         # Run migrations
pnpm db:generate        # Generate new migration
pnpm db:studio          # Open Drizzle Studio
pnpm db:seed            # Seed test data

# Build and deployment
pnpm build              # Build for production
pnpm start              # Start production server
```

### Debugging
```bash
# Debug mode with breakpoints
pnpm dev:debug

# Test debugging
pnpm test:debug

# Database debugging
pnpm db:studio
```

### Performance Monitoring
```bash
# API performance
pnpm dev:profile

# Memory usage
node --inspect-brk ./dist/server.js

# Database query analysis
# Use pgAnalyze or built-in query logging
```

## 📊 Development Metrics

### Code Quality Targets
- **Test Coverage**: >90%
- **Type Coverage**: 100%
- **ESLint Errors**: 0
- **Build Time**: <30s
- **Test Runtime**: <5s

### Performance Targets
- **API Response Time**: <200ms (95th percentile)
- **Database Query Time**: <50ms average
- **Memory Usage**: <512MB
- **CPU Usage**: <70% average

### Architecture Compliance
- ✅ No domain layer dependencies on external frameworks
- ✅ All use cases have corresponding tests
- ✅ Database access only through repository interfaces
- ✅ Controllers only handle HTTP concerns
- ✅ Proper error handling at all layers

## 🚨 Common Pitfalls

### Architecture Violations
```typescript
// ❌ DON'T: Domain logic in controllers
export class UserController {
  async updateUser(req: Request, res: Response) {
    // Business logic should be in use case, not controller
    if (user.email !== req.body.email && await this.checkEmailExists(req.body.email)) {
      return res.status(400).json({ error: 'Email already exists' });
    }
  }
}

// ✅ DO: Keep controllers thin
export class UserController {
  async updateUser(req: Request, res: Response) {
    const result = await this.updateUserUseCase.execute({
      userId: req.params.id,
      ...req.body
    });
    res.json(result);
  }
}
```

### Testing Mistakes
```typescript
// ❌ DON'T: Test implementation details
it('should call userRepository.create', async () => {
  await useCase.execute(validRequest);
  expect(mockUserRepository.create).toHaveBeenCalled(); // Testing implementation
});

// ✅ DO: Test behavior and outcomes
it('should return created user data', async () => {
  const result = await useCase.execute(validRequest);
  expect(result).toMatchObject({
    id: expect.any(String),
    email: validRequest.email,
    username: validRequest.username
  });
});
```

### Performance Issues
```typescript
// ❌ DON'T: N+1 queries
const users = await userRepository.findAll();
for (const user of users) {
  user.posts = await postRepository.findByUserId(user.id); // N+1 problem
}

// ✅ DO: Batch operations
const users = await userRepository.findAllWithPosts(); // Single optimized query
```

## 🎯 Next Steps

Ready to start developing? Choose your path:

1. **New Feature** → [Creating a New Module](creating-a-new-module.md)
2. **Extend Existing** → [Adding Endpoints](adding-endpoints.md)  
3. **Improve Quality** → [Writing Tests](writing-tests.md)
4. **Error Handling** → [Error Handling](error-handling.md)

## 📞 Getting Help

### Documentation Resources
- [Architecture Overview](../architecture/) - Understanding system design
- [API Reference](../reference/) - Endpoint specifications
- [Examples](../examples/) - Working code samples

### Development Support
- **Code Reviews** - Get feedback on pull requests
- **Pair Programming** - Work with experienced developers
- **Team Discussion** - Ask questions in development channels

### Quick Reference
- [Clean Architecture Principles](../architecture/clean-architecture.md)
- [Module Pattern Guide](../architecture/module-pattern.md)
- [Database Layer Architecture](../architecture/database-layer.md)
- [Testing Examples](../examples/testing-patterns.md)

---

**Ready to build?** Start with [Creating a New Module](creating-a-new-module.md) for new features, or [Adding Endpoints](adding-endpoints.md) to extend existing functionality.