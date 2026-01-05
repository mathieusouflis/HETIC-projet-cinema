# 🗃️ Database Setup

Cinema uses PostgreSQL. You can run it via Docker or locally.

{% tabs %}
{% tab title="Docker (recommended)" %}

#### Start Postgres

From the repo root:

```bash
pnpm db:start
```

Verify it’s running:

```bash
docker ps
```

#### Apply migrations

```bash
cd apps/api && pnpm db:migrate
```

#### Optional: seed data

```bash
cd apps/api && pnpm db:seed
```

{% endtab %}

{% tab title="Local PostgreSQL" %}

#### Create database and user

Example using `psql`:

```bash
psql -U postgres
```

```sql
CREATE DATABASE cinema_dev;
CREATE USER cinema WITH PASSWORD 'cinema';
GRANT ALL PRIVILEGES ON DATABASE cinema_dev TO cinema;
```

Update your `.env` to match.

#### Apply migrations

```bash
cd apps/api && pnpm db:migrate
```

{% endtab %}
{% endtabs %}

### Verify connectivity

```bash
pg_isready
```

If migrations succeed, move on:

- [Running the API](../api/running-the-api.md)
