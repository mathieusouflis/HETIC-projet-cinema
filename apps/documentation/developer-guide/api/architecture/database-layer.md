# 🗄️ Database Layer

The API uses PostgreSQL plus an ORM (Drizzle). Keep DB access behind repositories.

### Core pieces

- **Schemas** define tables.
- **Migrations** version schema changes.
- **Repositories** implement domain interfaces.

### Typical workflow

1. Update a schema file in a module.
2. Generate a migration.
3. Apply the migration.

```bash
pnpm db:generate
pnpm db:migrate
```

### Rule of thumb

Use cases should never talk SQL.

They should call a repository interface.

### Related

- [Database Setup](../../tools-and-setup/database-setup.md)
- [Project Structure](project-structure.md)
