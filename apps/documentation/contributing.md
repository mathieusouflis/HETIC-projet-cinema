---
description: >-
  Contributing guidelines for the Cinema Project - how to contribute code,
  report issues, and collaborate effectively
---

# 🤝 Contributing Guidelines

Welcome to the Cinema Project! We're excited that you're interested in contributing. This document outlines our processes, standards, and guidelines to help you contribute effectively.

## 🎯 Ways to Contribute

### Code Contributions

* **Bug fixes** - Fix issues and improve stability
* **New features** - Add functionality following our architecture
* **Performance improvements** - Optimize existing code
* **Documentation** - Improve or add documentation
* **Tests** - Add or improve test coverage

### Non-Code Contributions

* **Bug reports** - Help us identify issues
* **Feature requests** - Suggest new functionality
* **Documentation improvements** - Fix typos, clarify content
* **Community support** - Help other contributors
* **Code reviews** - Review pull requests

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

Follow our [coding standards](contributing.md#coding-standards) and [architecture guidelines](developer-guide/architecture/api-architecture/architecture.md).

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

* Push your branch to your fork
* Create a pull request with a clear description
* Link any related issues
* Ensure CI checks pass

## 📋 Pull Request Process

### Before Submitting

* [ ] Tests pass (`pnpm test`)
* [ ] Code is linted (`pnpm lint`)
* [ ] Types are correct (`pnpm type-check`)
* [ ] Code is formatted (`pnpm format`)
* [ ] Documentation is updated
* [ ] CHANGELOG is updated (for notable changes)

## 🧪 Testing Guidelines

### Testing Strategy

* **Unit Tests** - Test individual functions and classes
* **Integration Tests** - Test component interactions
* **E2E Tests** - Test complete user workflows

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

* **Minimum coverage**: 90%
* **New code**: 100% coverage required
* **Critical paths**: Authentication, data persistence, business logic

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

* **feat**: New feature
* **fix**: Bug fix
* **docs**: Documentation changes
* **style**: Code style changes (formatting, etc.)
* **refactor**: Code refactoring
* **test**: Adding or updating tests
* **chore**: Maintenance tasks

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

* **pre-commit**: Lint and format staged files
* **commit-msg**: Validate commit message format
* **pre-push**: Run tests before pushing

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
