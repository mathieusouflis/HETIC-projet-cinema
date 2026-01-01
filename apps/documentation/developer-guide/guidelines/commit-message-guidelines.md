# Commit Message Guidelines

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
