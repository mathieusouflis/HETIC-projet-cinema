# ▶️ Running the API

Run the API in dev mode first. Use production mode only when deploying.

### Development mode

From repo root, start the API (use the command that exists in your repo):

```bash
pnpm dev:api
```

Or start it from the package:

```bash
cd apps/api && pnpm dev
```

The API base URL is typically:

- `http://localhost:3000/api/v1`

### Quick health check

```bash
curl http://localhost:3000/api/v1
```

### Production mode

```bash
cd apps/api
pnpm build
pnpm start
```

### Common issues

#### Port already in use

macOS/Linux:

```bash
lsof -ti:3000 | xargs kill -9
```

Windows (PowerShell):

```powershell
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process -Force
```

#### Database connection errors

```bash
pg_isready
pnpm db:reset
```
