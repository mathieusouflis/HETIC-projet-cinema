---
description: Contributing guidelines for the Cinema Project - how to contribute code, report issues, and collaborate effectively
---

# Contributing Guidelines

Welcome to the Cinema Project! We're excited that you're interested in contributing. This document outlines our processes, standards, and guidelines to help you contribute effectively.

## 🎯 Ways to Contribute

### Code Contributions
- **Bug fixes** - Fix issues and improve stability
- **New features** - Add functionality following our architecture
- **Performance improvements** - Optimize existing code
- **Documentation** - Improve or add documentation
- **Tests** - Add or improve test coverage

### Non-Code Contributions
- **Bug reports** - Help us identify issues
- **Feature requests** - Suggest new functionality
- **Documentation improvements** - Fix typos, clarify content
- **Community support** - Help other contributors
- **Code reviews** - Review pull requests

## 🚀 Getting Started

### 1. Set Up Development Environment
```bash
# Fork and clone the repository
git clone https://github.com/your-username/HETIC-projet-cinema.git
cd HETIC-projet-cinema

# Install dependencies
pnpm install

# Set up environment
cp apps/api/.env.example apps/api/.env
cp apps/front/.env.example apps/front/.env.local

# Start database and run migrations
pnpm db:start
pnpm db:migrate

# Start development servers
pnpm dev
```

### 2. Create a Feature Branch
```bash
# Create and switch to a new branch
git checkout -b feature/your-feature-name

# Or for bug fixes
git checkout -b fix/issue-description
```

### 3. Make Your Changes
Follow our [coding standards](#coding-standards) and [architecture guidelines](api-documentation/architecture/).

### 4. Test Your Changes
```bash
# Run all tests
pnpm test

# Run linting
pnpm lint

# Type checking
pnpm type-check

# Format code
pnpm format
```

### 5. Submit a Pull Request
- Push your branch to your fork
- Create a pull request with a clear description
- Link any related issues
- Ensure CI checks pass

## 📋 Pull Request Process

### Before Submitting
- [ ] Tests pass (`pnpm test`)
- [ ] Code is linted (`pnpm lint`)
- [ ] Types are correct (`pnpm type-check`)
- [ ] Code is formatted (`pnpm format`)
- [ ] Documentation is updated
- [ ] CHANGELOG is updated (for notable changes)

### Pull Request Template
```markdown
## Description
Brief description of changes made.

## Type of Change
- [ ] Bug fix (non-breaking change that fixes an issue)
- [ ] New feature (non-breaking change that adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing
- [ ] Added/updated unit tests
- [ ] Added/updated integration tests
- [ ] Manual testing completed

## Related Issues
Closes #[issue number]

## Screenshots (if applicable)
Add screenshots to help explain your changes.

## Checklist
- [ ] My code follows the project's coding standards
- [ ] I have performed a self-review of my code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
```

### Review Process
1. **Automated Checks** - CI runs tests, linting, type checking
2. **Code Review** - Team members review the code
3. **Testing** - Manual testing if needed
4. **Approval** - At least one maintainer approval required
5. **Merge** - Squash and merge into main branch

## 🎨 Coding Standards

### General Principles
- **Clean Architecture** - Follow the established layer separation
- **Type Safety** - Use TypeScript throughout
- **Test Coverage** - Maintain >90% test coverage
- **Documentation** - Document public APIs and complex logic
- **Performance** - Consider performance implications

### Code Style
We use automated tools for consistent code style:

```bash
# ESLint for code quality
pnpm lint

# Prettier for code formatting
pnpm format

# TypeScript for type checking
pnpm type-check
```

### File Organization
```
# Use kebab-case for files and directories
user-service.ts
auth-middleware.ts

# Use PascalCase for classes and interfaces
class UserService
interface IUserRepository

# Use camelCase for variables and functions
const userName = 'john'
function getUserById(id: string)

# Use SCREAMING_SNAKE_CASE for constants
const MAX_RETRY_ATTEMPTS = 3
```

### TypeScript Guidelines
```typescript
// ✅ Good: Clear interfaces and types
interface CreateUserRequest {
  email: string;
  username: string;
  password: string;
}

export class UserService {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordService: IPasswordService
  ) {}

  async createUser(request: CreateUserRequest): Promise<User> {
    // Implementation with proper error handling
  }
}

// ❌ Avoid: Any types and unclear interfaces
const createUser = (data: any) => {
  // Implementation without proper typing
};
```

### Clean Architecture Compliance
```typescript
// ✅ Good: Proper layer separation
// Domain layer - pure business logic
export class User {
  constructor(
    public readonly id: string,
    public readonly email: string
  ) {}

  canBeDeleted(): boolean {
    // Business rule
    return this.isActive === false;
  }
}

// Application layer - use cases
export class DeleteUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(userId: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user?.canBeDeleted()) {
      throw new UserCannotBeDeletedError();
    }
    await this.userRepository.delete(userId);
  }
}

// ❌ Avoid: Mixed concerns
export class UserController {
  async deleteUser(req: Request, res: Response) {
    // DON'T: Business logic in controller
    const user = await db.select().from(users).where(eq(users.id, req.params.id));
    if (user.isActive) {
      return res.status(400).json({ error: 'Cannot delete active user' });
    }
  }
}
```

## 🧪 Testing Guidelines

### Testing Strategy
- **Unit Tests** - Test individual functions and classes
- **Integration Tests** - Test component interactions
- **E2E Tests** - Test complete user workflows

### Test Structure
```typescript
// Arrange - Act - Assert pattern
describe('UserService', () => {
  describe('createUser', () => {
    it('should create user with valid data', async () => {
      // Arrange
      const request = { email: 'test@example.com', username: 'test', password: 'password' };
      const mockUser = new User('1', 'test@example.com', 'test');
      mockUserRepository.create.mockResolvedValue(mockUser);

      // Act
      const result = await userService.createUser(request);

      // Assert
      expect(result).toEqual(mockUser);
      expect(mockUserRepository.create).toHaveBeenCalledWith(request);
    });

    it('should throw error when email already exists', async () => {
      // Arrange
      const request = { email: 'existing@example.com', username: 'test', password: 'password' };
      mockUserRepository.existsByEmail.mockResolvedValue(true);

      // Act & Assert
      await expect(userService.createUser(request)).rejects.toThrow(EmailAlreadyExistsError);
    });
  });
});
```

### Test Coverage Requirements
- **Minimum coverage**: 90%
- **New code**: 100% coverage required
- **Critical paths**: Authentication, data persistence, business logic

### Testing Commands
```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage

# Run specific test file
pnpm test user.test.ts

# Run integration tests
pnpm test:integration

# Run E2E tests
pnpm test:e2e
```

## 📝 Commit Message Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/) specification:

### Format
```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Types
- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, etc.)
- **refactor**: Code refactoring
- **test**: Adding or updating tests
- **chore**: Maintenance tasks

### Examples
```bash
# Feature
feat(auth): add JWT token refresh functionality

# Bug fix
fix(api): resolve user registration validation error

# Documentation
docs(api): update authentication endpoint documentation

# Breaking change
feat(users)!: change user ID format to UUID

BREAKING CHANGE: User IDs are now UUIDs instead of incremental integers
```

### Git Hooks
We use Husky for automated checks:
- **pre-commit**: Lint and format staged files
- **commit-msg**: Validate commit message format
- **pre-push**: Run tests before pushing

## 🐛 Bug Reports

### Before Reporting
1. **Search existing issues** - Check if the bug is already reported
2. **Reproduce the issue** - Ensure it's consistently reproducible
3. **Check latest version** - Verify the bug exists in the latest code

### Bug Report Template
```markdown
**Bug Description**
A clear and concise description of the bug.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected Behavior**
A clear description of what you expected to happen.

**Screenshots**
If applicable, add screenshots to help explain your problem.

**Environment:**
- OS: [e.g. macOS 14.0]
- Node.js: [e.g. 20.10.0]
- Browser: [e.g. Chrome 119]
- API Version: [e.g. v1]

**Additional Context**
Add any other context about the problem here.
```

## 💡 Feature Requests

### Before Requesting
1. **Check existing requests** - See if someone already suggested it
2. **Consider the scope** - Ensure it fits the project goals
3. **Think about implementation** - Consider how it might work

### Feature Request Template
```markdown
**Is your feature request related to a problem?**
A clear description of what the problem is. Ex. I'm always frustrated when [...]

**Describe the solution you'd like**
A clear description of what you want to happen.

**Describe alternatives you've considered**
A clear description of any alternative solutions or features you've considered.

**Additional context**
Add any other context or screenshots about the feature request here.

**Implementation Ideas**
If you have ideas about how this could be implemented, please share them.
```

## 🔄 Release Process

### Versioning
We use [Semantic Versioning](https://semver.org/):
- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### Release Checklist
- [ ] All tests pass
- [ ] Documentation is updated
- [ ] CHANGELOG is updated
- [ ] Version is bumped
- [ ] Release notes are prepared

## 🤝 Community Guidelines

### Code of Conduct
- **Be respectful** - Treat everyone with respect
- **Be constructive** - Provide helpful feedback
- **Be collaborative** - Work together towards common goals
- **Be inclusive** - Welcome contributors from all backgrounds

### Communication Channels
- **GitHub Issues** - Bug reports and feature requests
- **Pull Requests** - Code contributions and reviews
- **Discussions** - Questions and general discussion
- **Code Reviews** - Constructive feedback on code

### Getting Help
1. **Documentation** - Check this documentation first
2. **Search Issues** - Look for existing solutions
3. **Ask Questions** - Use GitHub Discussions
4. **Join the Community** - Participate in code reviews and discussions

## 🎓 Learning Resources

### Project-Specific
- [Architecture Overview](api-documentation/architecture/)
- [Development Guide](api-documentation/development-guide/)
- [API Reference](api-documentation/reference/)
- [Examples](api-documentation/examples/)

### General Resources
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [Testing JavaScript](https://testingjavascript.com/)

## 📞 Questions?

If you have questions about contributing:
- Check the [FAQ](faq.md)
- Search [existing discussions](https://github.com/your-org/cinema/discussions)
- Ask in [GitHub Discussions](https://github.com/your-org/cinema/discussions)
- Review the [documentation](README.md)

## 🙏 Recognition

Contributors are recognized in:
- **README.md** - All contributors listed
- **CHANGELOG.md** - Notable contributions mentioned
- **Release Notes** - Major contributions highlighted

Thank you for contributing to the Cinema Project! 🎬