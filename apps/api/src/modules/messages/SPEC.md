# Messaging Feature — Specification (3-module architecture)

## Module map

| Module | Kind | Prefix | Responsibility |
|---|---|---|---|
| `friendships` | REST | `/api/v1/friendships` | Friend requests lifecycle (send / accept / reject / remove) |
| `conversations` | REST | `/api/v1/conversations` | Conversation creation, listing, read state |
| `messages` | Hybrid (REST + WS) | `/api/v1/messages` + WS `/messages` | Message CRUD + real-time delivery |

**Dependency order**: `friendships` ← `conversations` (requires accepted friendship to open a DM) ← `messages` (requires participant membership).

---

## Migration note — `users` module

Friendship code currently lives in `users`. It must be **extracted** into the new `friendships` module:

| What to move | From | To |
|---|---|---|
| `create-friendship.use-case.ts` | `users/application/use-cases/` | `friendships/application/use-cases/` |
| `delete-friendship.use-case.ts` | `users/application/use-cases/` | `friendships/application/use-cases/` |
| `get-my-following.use-case.ts` | `users/application/use-cases/` | `friendships/application/use-cases/` |
| `get-user-followers.use-case.ts` | `users/application/use-cases/` | `friendships/application/use-cases/` |
| `get-user-following.use-case.ts` | `users/application/use-cases/` | `friendships/application/use-cases/` |
| `IFriendshipsRepository.ts` | `users/domain/interfaces/` | `friendships/domain/interfaces/` |
| `friendship.entity.ts` | `users/domain/entities/` | `friendships/domain/entities/` |
| `friendship.repository.ts` | `users/infrastructure/database/repositories/` | `friendships/infrastructure/repositories/` |
| `friendships.schema.ts` | `users/infrastructure/database/schemas/` | `friendships/infrastructure/schemas/` |
| friendship DTOs & validators | `users/application/dto/` | `friendships/application/dto/` |
| `POST /users/me/friendships/:id` | `UsersController` | `FriendshipsController` |
| `DELETE /users/me/friendships/:id` | `UsersController` | `FriendshipsController` |
| `GET /users/me/friendships` | `UsersController` | `FriendshipsController` |

After extraction the `UsersModule` drops its `IFriendshipsRepository` dependency entirely.

---

## Module 1 — `friendships`

### Folder structure

```
modules/friendships/
├── application/
│   ├── controllers/
│   │   └── friendships.controller.ts
│   ├── dto/
│   │   ├── request/
│   │   │   ├── friendship-params.validator.ts          ← { id: uuid }
│   │   │   └── update-friendship-body.validator.ts     ← { status: "accepted" | "rejected" }
│   │   └── response/
│   │       └── friendship.response.validator.ts
│   └── use-cases/
│       ├── send-friend-request.use-case.ts             ← was CreateFriendshipUseCase
│       ├── respond-to-friend-request.use-case.ts       ← NEW (accept / reject)
│       ├── remove-friendship.use-case.ts               ← was DeleteFriendshipUseCase
│       ├── get-my-friendships.use-case.ts              ← was GetMyFollowingUseCase
│       ├── get-user-followers.use-case.ts              ← moved
│       └── get-user-following.use-case.ts              ← moved
├── domain/
│   ├── entities/
│   │   └── friendship.entity.ts
│   └── interfaces/
│       └── IFriendshipsRepository.ts
├── infrastructure/
│   ├── repositories/
│   │   └── friendships.repository.ts
│   └── schemas/
│       └── friendships.schema.ts
└── friendships.module.ts
```

### REST endpoints (prefix `/api/v1/friendships`)

#### `GET /`
List caller's own friendships, optionally filtered by status.

**Query**: `?status=pending|accepted|rejected`
**Auth**: required
**Response 200**: `FriendshipDTO[]`

#### `POST /:userId`
Send a friend request. Status defaults to `pending`.

**Auth**: required
**Rules**: `userId !== callerId` → `400`. Throws `409` if a row already exists in either direction.
**Response 201**: `FriendshipDTO`

#### `PATCH /:friendshipId`
Accept or reject a pending request. Only the **recipient** (`friendId` column) may call this.

**Body**: `{ "status": "accepted" | "rejected" }`
**Auth**: required
**Rules**: Throws `403` if caller is the sender. Throws `404` if not found.
**Response 200**: `FriendshipDTO`

#### `DELETE /:friendshipId`
Remove a friendship or cancel a pending request. Either side may call this.

**Auth**: required
**Response 204**

### FriendshipDTO

```ts
{
  id: string;
  userId: string;           // sender
  friendId: string;         // recipient
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
  updatedAt: string;
}
```

### IFriendshipsRepository additions

```ts
// Find an accepted friendship between two users regardless of direction
findAccepted(userA: string, userB: string): Promise<Friendship | null>;
```

---

## Module 2 — `conversations`

### Folder structure

```
modules/conversations/
├── application/
│   ├── controllers/
│   │   └── conversations.controller.ts
│   ├── dto/
│   │   ├── request/
│   │   │   ├── create-conversation.body.validator.ts  ← { friendId: uuid }
│   │   │   └── conversation-params.validator.ts       ← { conversationId: uuid }
│   │   └── response/
│   │       └── conversation.response.validator.ts
│   └── use-cases/
│       ├── create-conversation.use-case.ts
│       ├── get-conversations.use-case.ts
│       ├── get-conversation.use-case.ts
│       └── mark-conversation-read.use-case.ts
├── domain/
│   ├── entities/
│   │   └── conversation.entity.ts
│   └── interfaces/
│       └── IConversationRepository.ts
├── infrastructure/
│   └── repositories/
│       └── conversation.repository.ts
└── conversations.module.ts
```

### REST endpoints (prefix `/api/v1/conversations`)

#### `GET /`
List all conversations for the caller, ordered by `updatedAt DESC`.

**Auth**: required
**Response 200**: `ConversationDTO[]` (with `unreadCount` + `lastMessage`)

#### `POST /`
Create a direct conversation with a friend (idempotent — returns existing if already open).

**Body**: `{ "friendId": "uuid" }`
**Auth**: required
**Business logic**:
1. `friendId !== callerId` → `400`
2. Friendship status must be `accepted` → `403 ForbiddenError`
3. Existing `direct` conversation where both are participants → return it (`200`)
4. Otherwise create `conversations` row + two `conversationParticipants` rows → `201`

#### `GET /:conversationId`
Single conversation detail. Caller must be a participant → `403`.

**Auth**: required
**Response 200**: `ConversationDTO`

#### `POST /:conversationId/read`
Update caller's `conversationParticipants.lastReadAt` to `NOW()`.

**Auth**: required. Caller must be a participant.
**Response 200**: `{ success: true }`

### ConversationDTO

```ts
{
  id: string;
  type: "direct";
  createdAt: string;
  updatedAt: string;
  otherParticipant: {
    id: string;
    username: string;
    avatarUrl: string | null;
  };
  lastMessage: {
    id: string;
    content: string | null;   // null if isDeleted
    isDeleted: boolean;
    createdAt: string;
    authorId: string;
  } | null;
  unreadCount: number;
}
```

### IConversationRepository

```ts
interface IConversationRepository {
  findAllForUser(userId: string): Promise<ConversationWithMeta[]>;
  findById(conversationId: string): Promise<Conversation | null>;
  findDirectBetween(userA: string, userB: string): Promise<Conversation | null>;
  create(createdBy: string, participantIds: [string, string]): Promise<Conversation>;
  isParticipant(conversationId: string, userId: string): Promise<boolean>;
  markAsRead(conversationId: string, userId: string): Promise<void>;
}
```

---

## Module 3 — `messages` (hybrid)

### Folder structure

```
modules/messages/
├── application/
│   ├── controllers/
│   │   ├── messages.rest.controller.ts
│   │   └── messages.ws.controller.ts
│   ├── dto/
│   │   ├── rest/
│   │   │   ├── request/
│   │   │   │   ├── message-conversation-params.validator.ts  ← { conversationId }
│   │   │   │   ├── message-params.validator.ts               ← { conversationId, messageId }
│   │   │   │   ├── get-messages.query.validator.ts           ← cursor-based
│   │   │   │   ├── send-message.body.validator.ts
│   │   │   │   └── edit-message.body.validator.ts
│   │   │   └── response/
│   │   │       └── message.response.validator.ts
│   │   └── ws/
│   │       ├── events/                              ← client → server payloads (Zod)
│   │       │   ├── ws-send-message.event.validator.ts
│   │       │   ├── ws-edit-message.event.validator.ts
│   │       │   ├── ws-delete-message.event.validator.ts
│   │       │   └── ws-typing.event.validator.ts
│   │       └── payloads/                            ← server → client shapes (types only)
│   │           ├── ws-new-message.payload.ts
│   │           ├── ws-updated-message.payload.ts
│   │           ├── ws-deleted-message.payload.ts
│   │           └── ws-typing.payload.ts
│   └── use-cases/
│       ├── get-messages.use-case.ts
│       ├── send-message.use-case.ts
│       ├── edit-message.use-case.ts
│       └── delete-message.use-case.ts
├── domain/
│   ├── entities/
│   │   └── message.entity.ts
│   └── interfaces/
│       └── IMessageRepository.ts
├── infrastructure/
│   └── repositories/
│       └── message.repository.ts
└── messages.module.ts
```

### REST endpoints (prefix `/api/v1/messages`)

#### `GET /conversations/:conversationId`
Paginated message history — cursor-based, newest-first.

**Auth**: required. Caller must be a participant → `403`.

**Query params**:
| Param | Type | Default | Description |
|---|---|---|---|
| `cursor` | uuid (optional) | — | ID of oldest message already loaded |
| `limit` | int 1–100 | 30 | Page size |

Fetches `limit` messages with `createdAt` strictly before the cursor message.
Soft-deleted messages appear as tombstones (`isDeleted: true, content: null`).

**Response 200**:
```json
{
  "success": true,
  "data": {
    "items": [],
    "nextCursor": "uuid | null",
    "hasMore": true
  }
}
```

#### `POST /conversations/:conversationId`
REST fallback to send a message (WS is the primary real-time path).

**Auth**: required. Caller must be a participant.
**Body**: `{ "content": "string (1–4000 chars)" }`
**Response 201**: `MessageDTO`
**Side-effect**: emit `message:new` to WS room `conversation:<conversationId>`.

#### `PATCH /conversations/:conversationId/:messageId`
Edit own message.

**Auth**: required. Caller must own the message → `403`.
**Body**: `{ "content": "string (1–4000 chars)" }`
**Response 200**: `MessageDTO`
**Side-effect**: emit `message:updated` to WS room.

#### `DELETE /conversations/:conversationId/:messageId`
Soft-delete own message.

**Auth**: required. Caller must own the message → `403`.
**Response 200**: `{ success: true }`
**Side-effect**: emit `message:deleted` to WS room.

### MessageDTO

```ts
{
  id: string;
  conversationId: string;
  author: { id: string; username: string; avatarUrl: string | null };
  content: string | null;   // null when isDeleted
  type: "text";
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string | null;
}
```

### IMessageRepository

```ts
interface IMessageRepository {
  findByConversation(
    conversationId: string,
    opts: { cursor?: string; limit: number }
  ): Promise<{ items: Message[]; nextCursor: string | null; hasMore: boolean }>;
  create(data: { conversationId: string; userId: string; content: string }): Promise<Message>;
  update(messageId: string, content: string): Promise<Message>;
  softDelete(messageId: string): Promise<void>;
  findById(messageId: string): Promise<Message | null>;
}
```

---

## WebSocket (namespace `/messages`)

**Auth**: `@RequireSocketAuth` (JWT via `socket.auth.token` or `Authorization: Bearer`)

### Rooms
`conversation:<conversationId>` — one room per conversation.

### Client → Server

| Event | Payload | Ack | Side-effect |
|---|---|---|---|
| `conversation:join` | `{ conversationId }` | `{ success } \| { error }` | `socket.join(room)` — server verifies participant |
| `conversation:leave` | `{ conversationId }` | — | `socket.leave(room)` |
| `message:send` | `{ conversationId, content }` | `{ success, message: MessageDTO } \| { error }` | persist → broadcast `message:new` to room |
| `message:edit` | `{ conversationId, messageId, content }` | `{ success, message: MessageDTO } \| { error }` | persist → broadcast `message:updated` |
| `message:delete` | `{ conversationId, messageId }` | `{ success } \| { error }` | soft-delete → broadcast `message:deleted` |
| `conversation:typing` | `{ conversationId, isTyping }` | — | broadcast `conversation:typing` to room **excluding sender** |

### Server → Client

| Event | Payload |
|---|---|
| `message:new` | `MessageDTO` |
| `message:updated` | `MessageDTO` |
| `message:deleted` | `{ messageId: string; conversationId: string }` |
| `conversation:typing` | `{ conversationId: string; userId: string; username: string; isTyping: boolean }` |

---

## TDD — Critical paths

### `friendships` module

**`send-friend-request.use-case`**
- ✅ Creates friendship with `pending` status
- ❌ Throws `ForbiddenError` when `userId === friendId`
- ❌ Throws `NotFoundError` when target user does not exist
- ❌ Throws `ConflictError` when a friendship row already exists

**`respond-to-friend-request.use-case`**
- ✅ Updates status to `accepted`
- ✅ Updates status to `rejected`
- ❌ Throws `ForbiddenError` when caller is the sender (not the recipient)
- ❌ Throws `NotFoundError` when friendship does not exist

### `conversations` module

**`create-conversation.use-case`**
- ✅ Creates a new `direct` conversation when friendship is `accepted`
- ✅ Returns the existing conversation (idempotent — no duplicate)
- ❌ Throws `ForbiddenError` when friendship is not `accepted`
- ❌ Throws `ForbiddenError` when `friendId === callerId`
- ❌ Throws `NotFoundError` when `friendId` does not exist

### `messages` module

**`send-message.use-case`**
- ✅ Persists and returns `MessageDTO`
- ❌ Throws `ForbiddenError` when caller is not a participant
- ❌ Throws `NotFoundError` when conversation does not exist
- ❌ Throws `ValidationError` when content length > 4000

**`edit-message.use-case`**
- ✅ Updates `content` + `updatedAt`, returns `MessageDTO`
- ❌ Throws `ForbiddenError` when caller does not own the message
- ❌ Throws `NotFoundError` when message does not exist

**`delete-message.use-case`**
- ✅ Sets `deletedAt`, does not hard-delete the row
- ❌ Throws `ForbiddenError` when caller does not own the message

**`get-messages.use-case`**
- ✅ Returns `limit` messages newest-first
- ✅ Cursor pagination returns items older than cursor
- ✅ Soft-deleted messages appear as tombstones
- ❌ Throws `ForbiddenError` when caller is not a participant

---

## Error taxonomy (shared)

| HTTP | Class | Trigger |
|---|---|---|
| 400 | `ValidationError` | Zod parse failure |
| 401 | `UnauthorizedError` | Missing / invalid JWT |
| 403 | `ForbiddenError` | Not a participant, not the author, not friends, wrong role on friendship |
| 404 | `NotFoundError` | Conversation / message / user / friendship not found |
| 409 | `ConflictError` | Duplicate friendship |

---

## Out of scope (MVP)

- Group conversations
- Message reactions / attachments
- Watchparty-linked message behaviour
- Online presence
- Push notifications
