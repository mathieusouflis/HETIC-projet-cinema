# Frontend Architecture

## Route Tree (TanStack Router)

Routing is file-based: TanStack Router automatically generates `routeTree.gen.ts` from files in `src/app/`.

```mermaid
graph TD
    ROOT["__root.tsx\nQueryClientProvider\nThemeProvider\nSentry"]

    ROOT --> LOGIN["login.tsx\n/login"]
    ROOT --> REGISTER["register.tsx\n/register"]
    ROOT --> FORGOT["forgot-password.tsx\n/forgot-password"]
    ROOT --> RESET["reset-password.tsx\n/reset-password"]
    ROOT --> VERIFY["verify-email.tsx\n/verify-email"]
    ROOT --> VERIFYPENDING["verify-email-pending.tsx\n/verify-email-pending"]
    ROOT --> MAIN["_main.tsx\nProtected layout\n(auth guard + nav)"]

    MAIN --> EXPLORE["explore.tsx\n/explore"]
    MAIN --> SEARCH["search.tsx\n/search"]
    MAIN --> WATCHLIST["watchlist.tsx\n/watchlist"]
    MAIN --> SETTINGS["settings.tsx\n/settings"]
    MAIN --> COMMUNITY["community.tsx\n/community"]
    MAIN --> MESSAGES_LAYOUT["messages.tsx\nMessages layout\n(Outlet)"]

    MESSAGES_LAYOUT --> MESSAGES_INDEX["messages/index.tsx\n/messages\n(empty state)"]
    MESSAGES_LAYOUT --> MESSAGES_CONV["messages/\$conversationId/index.tsx\n/messages/:conversationId\n(chat panel)"]
```

**Note:** `_main.tsx` is a layout route (the `_` prefix = no URL segment). It wraps all protected routes with the navigation component and `SearchProvider`. `messages.tsx` is also a layout route that renders `<Outlet />`.

---

## Modular Frontend Architecture

```mermaid
graph TD
    subgraph routing["Routing (TanStack Router)"]
        ROUTES["src/app/\n(route files)"]
    end

    subgraph features["Feature Modules (src/features/)"]
        AUTH_F["auth\ncomponents + hooks\n+ stores"]
        CONTENT_F["content\ncomponents + hooks"]
        EXPLORE_F["explore\ncomponents"]
        SEARCH_F["search / search-modal\ncomponents"]
        MSG_F["messages\ncomponents + hooks\n+ stores"]
        WATCHLIST_F["watchlist\ncomponents"]
        COMMUNITY_F["community\ncomponents"]
        SETTINGS_F["settings\ncomponents"]
        THEME_F["theme\nThemeProvider + store"]
    end

    subgraph services["API Services (src/lib/api/services/)"]
        AUTH_S["auth.ts"]
        CONTENTS_S["contents.ts"]
        CONV_S["conversations.ts"]
        FRIEND_S["friendships.ts"]
        MSG_S["messages.ts"]
        USERS_S["users.ts"]
        WATCHLIST_S["watchlists.ts"]
        GENRES_S["genres.ts"]
        PEOPLES_S["peoples.ts"]
    end

    subgraph stores["Zustand Stores"]
        AUTH_STORE["useAuth\n(sessionStorage)"]
        THEME_STORE["useThemeStore\n(localStorage)"]
        TYPING_STORE["useTypingStore\n(ephemeral)"]
    end

    subgraph socket["Socket.IO (src/lib/socket/)"]
        WS["getWebsocketServices()\n(singleton)"]
    end

    subgraph sdk["SDK (packages/api-sdk)"]
        GENERATED["generated functions\ngETContents, pOSTAuthLogin..."]
    end

    ROUTES --> features
    features --> services
    features --> stores
    features --> socket
    services --> GENERATED
    MSG_F --> WS
    AUTH_F --> AUTH_STORE
    THEME_F --> THEME_STORE
    MSG_F --> TYPING_STORE
```

---

## Service Pattern: Dual Export (imperative + reactive)

Each service exposes two interfaces:

| Export | Type | Usage |
|---|---|---|
| `xxxService` | Pure `async` functions | Event handlers, mutations outside React components |
| `queryXxxService` | `useQuery` / `useMutation` hooks (TanStack Query) | React components (reactive data) |

```typescript
// Imperative — in an onClick
const api = getApi();
await api.auth.login({ email, password });

// Reactive — in a React component
const { data } = queryContentService.getContents({ page: 1 });
```

---

## Zustand Stores

| Store | File | Persistence | Content |
|---|---|---|---|
| `useAuth` | `features/auth/stores/auth.store.ts` | sessionStorage (key `auth`) | `user`, `isLoading`, `error` + setters |
| `useThemeStore` | `features/theme/stores/theme.store.ts` | localStorage (key `theme-storage`) | `theme: "dark" \| "light" \| "system"` |
| `useTypingStore` | `features/messages/stores/typing.store.ts` | None (ephemeral) | `typingByConversation: Record<convId, userId[]>` |

---

## Auto-generated SDK Pipeline

```mermaid
flowchart LR
    ZOD["Zod Schemas\n(backend DTOs)\napps/api/src/modules/*/\napplication/dto/"]
    OPENAPI_GEN["@asteasolutions/zod-to-openapi\n(generated at build)"]
    OPENAPI_SPEC["apps/api/api-documentation.json\n(OpenAPI 3.x spec)"]
    ORVAL["Orval\n(code generator)"]
    SDK_GEN["packages/api-sdk/src/generated/\nmodels/ + services/"]
    SDK_INDEX["packages/api-sdk/src/index.ts\n(export point)"]
    TQ["TanStack Query hooks\n(in frontend services)\nqueryXxxService"]
    FRONT["React components\n(apps/front)"]

    ZOD --> OPENAPI_GEN
    OPENAPI_GEN --> OPENAPI_SPEC
    OPENAPI_SPEC --> ORVAL
    ORVAL --> SDK_GEN
    SDK_GEN --> SDK_INDEX
    SDK_INDEX --> TQ
    TQ --> FRONT
```

**Command:** `pnpm generate-sdk` (= `turbo run generate-sdk`)

**Generated function naming:** HTTP verb in uppercase followed by the route in camelCase (e.g. `gETContents`, `pOSTAuthLogin`, `dELETEUsersMe`). This reflects Orval's behavior with the current configuration.

**Important:** `packages/api-sdk` has no `dist/` folder. Imports must always be from source. The Vitest configuration must alias `@packages/api-sdk` to `packages/api-sdk/src/index.ts`.

---

## UI Components

23 components in `src/components/ui/` following shadcn conventions (Radix UI + TailwindCSS): `accordion`, `avatar`, `button`, `calendar`, `card`, `dialog`, `dropdown-menu`, `field`, `form`, `input`, `input-group`, `label`, `pagination`, `popover`, `scroll-area`, `select`, `separator`, `skeleton`, `tabs`, `textarea`, `tooltip`, and a `filters/` subdirectory.

---

## Entry Point (`main.tsx`)

1. Sentry initialization (error tracking, session replay, tracing)
2. TanStack Router instance creation from `routeTree.gen.ts`
3. `QueryClientProvider` setup
4. Wrap in `ThemeProvider`
5. Mount on `#root`
