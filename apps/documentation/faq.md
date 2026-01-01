---
description: Frequently Asked Questions about the Cinema Project - development, architecture, and common issues
---

# Frequently Asked Questions (FAQ)

This page addresses common questions about the Cinema Project, from development setup to architecture decisions. If you don't find your answer here, check our [Contributing Guidelines](contributing.md) or ask in [GitHub Discussions](https://github.com/your-org/cinema/discussions).

## 🚀 Getting Started

### Q: What are the system requirements?
**A:** You need:
- **Node.js 20+** - JavaScript runtime
- **pnpm** - Package manager (preferred over npm/yarn)
- **PostgreSQL 14+** - Database server
- **Git** - Version control
- **8GB RAM** minimum for development
- **Docker** (optional) for containerized database

### Q: Why does the installation fail with permission errors?
**A:** This usually happens when:
1. **Node.js installed with sudo** - Reinstall Node.js without sudo or use a version manager like `nvm`
2. **pnpm not installed** - Install pnpm globally: `npm install -g pnpm`
3. **Wrong directory permissions** - Ensure your user owns the project directory

```bash
# Fix ownership (macOS/Linux)
sudo chown -R $USER:$USER /path/to/HETIC-projet-cinema

# Reinstall dependencies
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Q: The development server won't start. What should I do?
**A:** Check these common issues:
1. **Port conflicts** - Ensure ports 3000 and 3001 are free
2. **Environment variables** - Copy and configure `.env` files
3. **Database connection** - Ensure PostgreSQL is running
4. **Dependencies** - Run `pnpm install` to ensure all packages are installed

```bash
# Check port usage
lsof -i :3000
lsof -i :3001

# Kill processes if needed
kill -9 <PID>

# Restart everything
pnpm db:start
pnpm dev
```

## 🏗️ Architecture

### Q: Why did you choose Clean Architecture?
**A:** Clean Architecture provides several benefits for our project:
- **Maintainability** - Clear separation of concerns makes code easier to understand and modify
- **Testability** - Dependencies can be easily mocked and tested in isolation
- **Scalability** - New features can be added without affecting existing code
- **Framework Independence** - Business logic is isolated from external frameworks
- **Team Development** - Multiple developers can work on different layers simultaneously

### Q: What's the difference between the layers?
**A:** Each layer has a specific responsibility:

| Layer | Location | Responsibility | Dependencies |
|-------|----------|---------------|--------------|
| **Domain** | `src/modules/*/domain/` | Business logic, entities, interfaces | None (pure) |
| **Application** | `src/modules/*/application/` | Use cases, orchestration | Domain only |
| **Infrastructure** | `src/modules/*/infrastructure/` | Data access, external services | Domain + Application |
| **Presentation** | `src/modules/*/presentation/` | HTTP routes, controllers | All layers |

### Q: How do I know which layer to put my code in?
**A:** Use this decision tree:
1. **Is it business logic?** → Domain layer
2. **Is it coordinating business operations?** → Application layer  
3. **Is it handling HTTP requests/responses?** → Presentation layer
4. **Is it accessing databases or external APIs?** → Infrastructure layer

### Q: Why use dependency injection instead of direct imports?
**A:** Dependency injection provides:
- **Testability** - Easy to mock dependencies for testing
- **Flexibility** - Can swap implementations without changing dependent code
- **Loose Coupling** - Components depend on interfaces, not concrete implementations
- **Configuration** - Can configure different implementations for different environments

## 🛠️ Development

### Q: How do I add a new feature?
**A:** Follow this process:
1. **Plan the feature** - Define requirements and API design
2. **Create a module** - Follow the [Creating a New Module](api-documentation/development-guide/creating-a-new-module.md) guide
3. **Implement layers** - Start with domain, then application, infrastructure, presentation
4. **Write tests** - Ensure comprehensive test coverage
5. **Update documentation** - Document new endpoints and functionality

### Q: How do I add a new endpoint to an existing module?
**A:** See the [Adding Endpoints](api-documentation/development-guide/adding-endpoints.md) guide:
1. **Define the route** in `presentation/routes/`
2. **Create controller method** in `presentation/controllers/`
3. **Add validation schema** using Zod
4. **Create use case** if needed in `application/`
5. **Write tests** for the endpoint
6. **Update API documentation**

### Q: What's the recommended Git workflow?
**A:** We use GitHub Flow:
1. **Create feature branch** from `main`
2. **Make changes** with good commit messages
3. **Push branch** to your fork
4. **Create pull request** with clear description
5. **Address review feedback**
6. **Merge** after approval

```bash
# Example workflow
git checkout main
git pull origin main
git checkout -b feature/new-watchparty-module
# Make changes...
git add .
git commit -m "feat(watchparty): add basic watchparty functionality"
git push origin feature/new-watchparty-module
# Create PR on GitHub
```

### Q: How do I run only specific tests?
**A:** Use these commands:
```bash
# Run specific test file
pnpm test user.test.ts

# Run tests matching pattern
pnpm test --grep "authentication"

# Run tests in specific directory
pnpm test src/modules/auth/

# Run integration tests only
pnpm test:integration

# Run with coverage
pnpm test:coverage
```

### Q: How do I debug the API?
**A:** Several debugging options:
1. **Console logging** - Use `console.log()` for quick debugging
2. **VS Code debugger** - Set breakpoints and run in debug mode
3. **API testing tools** - Use Postman, Insomnia, or Thunder Client
4. **Database inspection** - Use Drizzle Studio: `pnpm db:studio`

```bash
# Debug mode with breakpoints
pnpm dev:debug

# Open debugger in Chrome
# Navigate to chrome://inspect
```

## 🗄️ Database

### Q: How do I create a database migration?
**A:** Use Drizzle's migration system:
```bash
# 1. Modify schema files in modules/*/infrastructure/database/schemas/
# 2. Generate migration
pnpm db:generate

# 3. Review generated migration in database/migrations/
# 4. Apply migration
pnpm db:migrate
```

### Q: How do I seed test data?
**A:** Create seed scripts:
```bash
# Create seed file in database/seeds/
# Run seeds
pnpm db:seed

# Or reset database with fresh seeds
pnpm db:reset
```

### Q: What if I need to rollback a migration?
**A:** Currently, Drizzle doesn't support automatic rollbacks. You need to:
1. **Create a new migration** that reverses the changes
2. **Or restore from backup** if available
3. **Or manually write SQL** to undo changes

```sql
-- Example rollback migration
DROP TABLE IF EXISTS new_table;
ALTER TABLE existing_table DROP COLUMN new_column;
```

### Q: How do I optimize database queries?
**A:** Follow these practices:
1. **Use indexes** - Add indexes for frequently queried columns
2. **Avoid N+1 queries** - Use joins or batch queries
3. **Use pagination** - Don't fetch all records at once
4. **Profile queries** - Use `EXPLAIN ANALYZE` in PostgreSQL

```typescript
// ❌ Bad: N+1 query problem
const users = await userRepository.findAll();
for (const user of users) {
  user.posts = await postRepository.findByUserId(user.id);
}

// ✅ Good: Single query with join
const usersWithPosts = await userRepository.findAllWithPosts();
```

## 🧪 Testing

### Q: What's the difference between unit and integration tests?
**A:** 
- **Unit tests** - Test individual functions/classes in isolation with mocked dependencies
- **Integration tests** - Test how multiple components work together
- **E2E tests** - Test complete user workflows through the API

### Q: How do I mock dependencies in tests?
**A:** Use Jest mocks with TypeScript:
```typescript
// Create mock
const mockUserRepository = {
  findById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
} as jest.Mocked<IUserRepository>;

// Use in test
beforeEach(() => {
  mockUserRepository.findById.mockClear();
});

it('should find user by ID', async () => {
  const user = new User('1', 'test@example.com');
  mockUserRepository.findById.mockResolvedValue(user);
  
  const result = await userService.findById('1');
  
  expect(result).toBe(user);
});
```

### Q: How do I test database operations?
**A:** Use test containers or in-memory databases:
```typescript
describe('UserRepository Integration', () => {
  let testDb: TestDatabase;

  beforeAll(async () => {
    testDb = await createTestDatabase();
  });

  afterAll(async () => {
    await testDb.cleanup();
  });

  it('should create user in database', async () => {
    const userData = { email: 'test@example.com', username: 'test' };
    const user = await userRepository.create(userData);
    
    expect(user.id).toBeDefined();
    expect(user.email).toBe(userData.email);
  });
});
```

## 🔐 Authentication & Security

### Q: How does JWT authentication work in this project?
**A:** We use a dual-token system:
1. **Access Token** - Short-lived (15 minutes), used for API requests
2. **Refresh Token** - Long-lived (7 days), used to get new access tokens

```mermaid
sequenceDiagram
    participant C as Client
    participant A as API
    
    C->>A: POST /auth/login
    A->>C: {accessToken, refreshToken}
    
    C->>A: GET /users/me (accessToken)
    A->>C: User data
    
    Note over C: Access token expires
    
    C->>A: POST /auth/refresh (refreshToken)
    A->>C: {newAccessToken, newRefreshToken}
```

### Q: How do I protect an endpoint?
**A:** Use the authentication middleware:
```typescript
// In route definition
router.get('/protected', 
  authenticateToken,  // Middleware
  controller.protectedEndpoint
);

// Or with role-based access
router.delete('/users/:id',
  authenticateToken,
  requireOwnership, // Custom middleware
  controller.deleteUser
);
```

### Q: How are passwords stored?
**A:** Passwords are hashed using bcrypt with salt rounds:
```typescript
// Hashing (registration)
const hashedPassword = await bcrypt.hash(password, 12);

// Verification (login)
const isValid = await bcrypt.compare(password, hashedPassword);
```

## 🚀 Deployment

### Q: How do I deploy to production?
**A:** Follow these steps:
1. **Build the application**: `pnpm build`
2. **Set environment variables** for production
3. **Run database migrations**: `pnpm db:migrate`
4. **Start the server**: `pnpm start`

### Q: What environment variables do I need?
**A:** Key variables for production:
```bash
# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/cinema"

# JWT secrets (generate secure random strings)
JWT_ACCESS_SECRET="your-access-token-secret"
JWT_REFRESH_SECRET="your-refresh-token-secret"

# Environment
NODE_ENV="production"
PORT="3000"

# Optional: Logging, monitoring, etc.
LOG_LEVEL="info"
```

### Q: How do I monitor the application in production?
**A:** Consider these monitoring solutions:
- **Application logs** - Use structured logging (Winston, Pino)
- **Error tracking** - Sentry, Bugsnag
- **Performance monitoring** - New Relic, DataDog
- **Database monitoring** - Built-in PostgreSQL logs, pgAnalyze
- **Health checks** - Implement `/health` endpoint

## 🐛 Troubleshooting

### Q: I'm getting "Cannot find module" errors
**A:** This usually indicates missing dependencies:
```bash
# Clean installation
rm -rf node_modules pnpm-lock.yaml
pnpm install

# Or for specific module
pnpm add missing-module-name
```

### Q: TypeScript errors about missing types
**A:** Install type definitions:
```bash
# For Node.js types
pnpm add -D @types/node

# For Express types
pnpm add -D @types/express

# For Jest types
pnpm add -D @types/jest
```

### Q: Database connection errors
**A:** Check these common issues:
1. **PostgreSQL not running**: `brew services start postgresql` (macOS) or `sudo service postgresql start` (Linux)
2. **Wrong credentials**: Check `DATABASE_URL` in `.env`
3. **Database doesn't exist**: Create it manually or run setup scripts
4. **Firewall blocking**: Ensure port 5432 is accessible

### Q: API returns 500 errors
**A:** Check the server logs for detailed error information:
```bash
# Development mode shows detailed errors
pnpm dev

# Check logs in production
tail -f logs/app.log

# Or use debugging
DEBUG=* pnpm start
```

### Q: Tests are failing randomly
**A:** Common causes:
1. **Race conditions** - Tests affecting each other's data
2. **Missing cleanup** - Database state not reset between tests
3. **Async timing issues** - Missing `await` keywords
4. **Mock state** - Mocks not properly reset between tests

```typescript
// Fix: Proper test isolation
beforeEach(async () => {
  await testDb.cleanup();
  jest.clearAllMocks();
});
```

## 📚 Learning & Best Practices

### Q: I'm new to Clean Architecture. Where should I start?
**A:** Recommended learning path:
1. **Read the basics** - [Clean Architecture overview](api-documentation/architecture/clean-architecture.md)
2. **Study existing code** - Look at the `users` and `auth` modules
3. **Start small** - Add a simple endpoint to existing module
4. **Build a module** - Follow the [Creating a New Module](api-documentation/development-guide/creating-a-new-module.md) guide
5. **Get feedback** - Submit pull requests for review

### Q: What are the most common mistakes new contributors make?
**A:** 
1. **Mixing layers** - Putting business logic in controllers
2. **Skipping tests** - Not writing tests for new functionality
3. **Ignoring types** - Using `any` instead of proper TypeScript types
4. **Direct database access** - Bypassing repository pattern
5. **Poor error handling** - Not implementing proper error responses

### Q: How do I stay updated with project changes?
**A:** 
1. **Watch the repository** on GitHub
2. **Read the [CHANGELOG](changelog.md)** for notable changes
3. **Participate in discussions** on GitHub
4. **Review pull requests** to see new patterns
5. **Check documentation updates** regularly

## 🤝 Contributing

### Q: I found a bug. How do I report it?
**A:** 
1. **Search existing issues** - Check if it's already reported
2. **Create detailed bug report** - Use our [bug report template](https://github.com/your-org/cinema/issues/new?template=bug_report.md)
3. **Include reproduction steps** - Make it easy to reproduce
4. **Add environment details** - OS, Node.js version, etc.

### Q: I want to add a major feature. What's the process?
**A:** 
1. **Open a discussion** - Discuss the feature idea first
2. **Create feature request** - Use our [feature request template](https://github.com/your-org/cinema/issues/new?template=feature_request.md)
3. **Get approval** - Wait for maintainer approval
4. **Plan implementation** - Design the architecture
5. **Implement incrementally** - Break into smaller PRs
6. **Update documentation** - Document the new feature

### Q: How can I get my pull request reviewed faster?
**A:** 
1. **Follow guidelines** - Ensure your PR meets all requirements
2. **Keep it small** - Smaller PRs are easier to review
3. **Write good descriptions** - Clearly explain what and why
4. **Add tests** - Include comprehensive test coverage
5. **Respond promptly** - Address feedback quickly

## 📞 Still Need Help?

If you don't find your answer here:

1. **Check the documentation** - [Developer Guide](developer/), [API Docs](api-documentation/)
2. **Search GitHub issues** - Someone might have asked before
3. **Ask in discussions** - [GitHub Discussions](https://github.com/your-org/cinema/discussions)
4. **Join the community** - Participate in code reviews and help others

### Quick Links
- [Contributing Guidelines](contributing.md)
- [Developer Setup](developer/)
- [API Documentation](api-documentation/)
- [Architecture Overview](api-documentation/architecture/)
- [GitHub Repository](https://github.com/your-org/cinema)

---

**Can't find what you're looking for?** Open a [new discussion](https://github.com/your-org/cinema/discussions/new) and we'll help you out!