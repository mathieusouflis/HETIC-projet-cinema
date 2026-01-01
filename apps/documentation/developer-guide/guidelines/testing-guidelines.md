# Testing Guidelines

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
