# TMDB Integration

The project fetches movie and series data on demand from [The Movie Database (TMDB)](https://www.themoviedb.org/) API and caches it in PostgreSQL. This document explains the full flow: from an incoming API request to data stored in the database and returned to the client.

---

## Why on-demand fetching?

Rather than importing TMDB's entire catalogue up front, Kirona fetches and stores content only when it is first requested. This means:
- The database starts empty and fills up organically with content users actually search for.
- A `tmdb_fetch_status` cache table prevents redundant external calls.
- The `composite repository` pattern makes this transparent to the use case layer.

---

## Architecture layers

```mermaid
graph TD
    UC["Use Case\ne.g. QueryMovieUseCase"]
    CR["CompositeMoviesRepository\nimplements IMoviesRepository"]
    TR["TMDBMoviesRepository\nfetches from TMDB API"]
    DR["DrizzleMoviesRepository\nreads/writes PostgreSQL"]
    TMDB["TMDB REST API\napi.themoviedb.org"]
    DB["PostgreSQL\ncontent, categories,\nstreaming_platforms,\npeople, content_credits…"]

    UC -->|"listMovies() / searchMovies()"| CR
    CR --> TR
    CR --> DR
    TR -->|"HTTP GET"| TMDB
    DR -->|"SQL"| DB
```

The use case always calls the **composite repository interface** (`IMoviesRepository`). It never knows whether the data came from TMDB or the local database.

---

## Full sequence — search request

```mermaid
sequenceDiagram
    participant Client
    participant UC as QueryMovieUseCase
    participant CR as CompositeMoviesRepository
    participant DR as DrizzleMoviesRepository
    participant TR as TMDBMoviesRepository
    participant TMDB as TMDB API
    participant DB as PostgreSQL

    Client->>UC: execute({ title: "Matrix", page: 1 })
    UC->>CR: listMovies("Matrix", ..., { page: 1 })

    Note over CR: Step 1 — Ask TMDB for matching IDs
    CR->>TR: search({ query: "Matrix", page: 1 })
    TR->>TMDB: GET /3/search/movie?query=Matrix&page=1
    TMDB-->>TR: { results: [{id:603,...},{id:234215,...}], total: 12 }
    TR-->>CR: { ids: [603, 234215, ...], total: 12 }

    Note over CR: Step 2 — Check which IDs are already in DB
    CR->>DR: getByTmdbIds([603, 234215, ...])
    DR->>DB: SELECT * FROM content WHERE tmdb_id IN (603, 234215, ...)
    DB-->>DR: [Movie#603]  ← only one found
    DR-->>CR: existingMovies: [Movie#603]

    Note over CR: Step 3 — Fetch detail for missing IDs from TMDB
    CR->>TR: getMultipleDetails([234215, ...])
    TR->>TMDB: GET /3/movie/234215?append_to_response=credits,watch/providers
    TMDB-->>TR: { id:234215, title:"...", genres:[...], credits:{...}, ... }
    TR-->>CR: [MovieProps#234215, ...]

    Note over CR: Step 4 — Sync related entities (idempotent)
    CR->>DR: ensureCategoriesExist([{id:28,name:"Action"}, ...])
    DR->>DB: INSERT INTO categories ... ON CONFLICT DO NOTHING
    CR->>DR: ensureProvidersExist([{provider_id:8,name:"Netflix"}, ...])
    DR->>DB: INSERT INTO streaming_platforms ... ON CONFLICT DO NOTHING
    CR->>DR: ensureCastsExist([{id:6384,name:"Keanu Reeves"}, ...])
    DR->>DB: INSERT INTO people ... ON CONFLICT DO NOTHING

    Note over CR: Step 5 — Create the content row + link relations
    CR->>DR: create(MovieProps#234215)
    DR->>DB: INSERT INTO content VALUES (...)
    CR->>DR: linkCategories(newId, [categoryId1, ...])
    DR->>DB: INSERT INTO content_categories VALUES (...)
    CR->>DR: linkProviders(newId, [platformId1, ...])
    DR->>DB: INSERT INTO content_platforms VALUES (...)
    CR->>DR: linkCast(newId, castList)
    DR->>DB: INSERT INTO content_credits VALUES (...)

    Note over CR: Step 6 — Merge and return
    CR->>DR: getByTmdbIds([603, 234215, ...])
    DR->>DB: SELECT * FROM content WHERE tmdb_id IN (...)
    DB-->>DR: [Movie#603, Movie#234215, ...]
    DR-->>CR: [Movie#603, Movie#234215, ...]
    CR-->>UC: [Movie#603, Movie#234215, ...]
    UC-->>Client: { data: [...], total: 12 }
```

---

## Key components

### `TmdbService`

**File:** `apps/api/src/shared/services/tmdb/tmdb-service.ts`

Thin wrapper around `fetch` that adds the API key, language, and base URL. Throws `ServerError` on non-2xx responses.

```typescript
const result = await this.tmdbService.request<TMDBMovieListResult>(
  "GET",
  "3/search/movie",
  { query: "Matrix", page: "1" }
);
```

### `BaseTMDBRepository`

**File:** `apps/api/src/shared/infrastructure/repositories/base-tmdb-repository.ts`

Abstract base for both `TMDBMoviesRepository` and `TMDBSeriesRepository`. Provides:

| Method | Description |
|---|---|
| `discover(params)` | Browse content by genre (`/discover/movie` or `/discover/tv`) |
| `search(params)` | Full-text search (`/search/movie` or `/search/tv`) |
| `detail(id)` | Fetch a single item with credits and watch providers |
| `getMultipleDetails(ids)` | Parallel `Promise.all` over `detail()` |

### `BaseCompositeRepository`

**File:** `apps/api/src/shared/infrastructure/repositories/base-composite-repository.ts`

Implements the merge logic described in the sequence diagram above. Shared by both `CompositeMoviesRepository` and `CompositeSeriesRepository`.

Key private methods:

| Method | What it does |
|---|---|
| `ensureCategoriesExist(genres)` | Upserts TMDB genre → `categories` row; caches ID in memory |
| `ensureProvidersExist(providers)` | Upserts streaming provider → `streaming_platforms` row |
| `ensureCastsExist(cast)` | Upserts cast member → `people` row |
| `ensureSeasonsExist(series, seasons)` | Creates `seasons` + `episodes` rows for series |
| `createEntitiesWithRelations(props[])` | Orchestrates the above, then creates `content` rows and junction table entries |

### `CompositeMoviesRepository` / `CompositeSeriesRepository`

Concrete implementations that extend `BaseCompositeRepository` and implement the domain interface (`IMoviesRepository` / `ISeriesRepository`). They expose the same methods the use case calls (`listMovies`, `searchMovies`, `getMovieById`).

---

## `tmdb_fetch_status` cache table

To avoid hitting the TMDB rate limit on repeated identical requests, the system stores fetch results with an expiry:

```sql
tmdb_fetch_status {
    path       varchar UNIQUE  -- e.g. "search/movie?query=Matrix&page=1"
    type       varchar         -- "search" | "discover"
    metadata   jsonb           -- raw TMDB response
    expires_at timestamp
}
```

The `remove_expired` constraint filters out stale entries. A lookup checks this table before making the HTTP call.

---

## Series-specific flow: seasons and episodes

Series have an additional sync step. After creating the `content` row:

```mermaid
flowchart TD
    A["content row created\n(type = 'serie')"]
    B["Fetch season list\nGET /3/tv/:id"]
    C["For each season:\nfetch episode list\nGET /3/tv/:id/season/:n"]
    D["INSERT INTO seasons"]
    E["INSERT INTO episodes\n(bulk per season)"]

    A --> B --> C --> D --> E
```

Episode bulk inserts are batched to avoid generating hundreds of individual queries for a series with many seasons.

---

## Adding support for a new content type

If you ever need to add a third content type (e.g. documentaries as a separate entity):

1. Create `TMDBDocumentaryRepository` extending `BaseTMDBRepository`
2. Create `DrizzleDocumentaryRepository` with the Drizzle schema
3. Create `CompositeDocumentaryRepository` extending `BaseCompositeRepository`
4. Create `IDocumentaryRepository` in the domain layer
5. Wire it in a new `documentaries` module

The composite base handles all the category/platform/cast sync logic — you only need to override what is specific to the new type.

---

## Environment variable

| Variable | Where it is used |
|---|---|
| `TMDB_API_KEY` | `TmdbService` constructor, via `config.env.externalApi.tmdbApiKey` |

If `TMDB_API_KEY` is missing, `TmdbService.request()` returns a 401 from TMDB and throws `ServerError`. Content search endpoints will fail until the key is set.
